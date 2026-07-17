from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.users.models import User
from apps.church.models import Branch, Service
from .models import Visitor

class VisitorAPITests(TestCase):
    """
    Tests for the Visitor Registration API endpoint.
    Verifies that receptionists can register visitors and that validation works.
    """
    def setUp(self):
        self.client = APIClient()
        
        # Create a Receptionist user
        self.receptionist = User.objects.create_user(
            username='reception1', 
            password='TestPass123!', 
            role=User.Roles.RECEPTIONIST
        )
        
        # Authenticate as the receptionist
        self.client.force_authenticate(user=self.receptionist)
        
        # Create a Branch and Service
        self.branch = Branch.objects.create(name='Test Branch')
        self.service = Service.objects.create(
            branch=self.branch, 
            name='Sabbath Service', 
            start_time='10:00:00'
        )
        
        self.visitor_data = {
            'full_name': 'John Doe',
            'gender': 'Male',
            'phone_number': '0712345678',
            'visitor_type': 'First Time',
            'branch': str(self.branch.id),
            'service_attended': str(self.service.id)
        }

    def test_create_visitor_success(self):
        """Test that a receptionist can successfully register a visitor."""
        url = reverse('visitor-list')
        response = self.client.post(url, self.visitor_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Visitor.objects.count(), 1)
        
        # Verify auto-generated registration number and assigned registrar
        visitor = Visitor.objects.first()
        self.assertIsNotNone(visitor.registration_number)
        self.assertTrue(visitor.registration_number.startswith('VIS-'))
        self.assertEqual(visitor.registered_by, self.receptionist)

    def test_create_visitor_missing_field(self):
        """Test that missing required fields returns 400 Bad Request."""
        invalid_data = self.visitor_data.copy()
        invalid_data['full_name'] = '' # Clear required field
        
        url = reverse('visitor-list')
        response = self.client.post(url, invalid_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class AttendanceAPITests(TestCase):
    """
    Tests for the Attendance Check-in API endpoint.
    Verifies that visitors can be checked in and that duplicate check-ins are prevented.
    """
    def setUp(self):
        self.client = APIClient()
        self.receptionist = User.objects.create_user(
            username='reception2', 
            password='TestPass123!', 
            role=User.Roles.RECEPTIONIST
        )
        self.client.force_authenticate(user=self.receptionist)
        
        self.branch = Branch.objects.create(name='Test Branch 2')
        self.service = Service.objects.create(
            branch=self.branch, name='Sunday Service', start_time='09:00:00'
        )
        
        self.visitor = Visitor.objects.create(
            full_name='Jane Doe',
            gender='Female',
            phone_number='0798765432',
            visitor_type='First Time'
        )

    def test_check_in_success(self):
        """Test that a visitor can be checked into a service successfully."""
        # Using direct path because DRF Router custom actions are safer to hit directly in tests
        url = '/api/v1/attendance/scan/'
        data = {
            'code': self.visitor.registration_number,
            'service': str(self.service.id)
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['visitor_name'], 'Jane Doe')

    def test_duplicate_check_in_fails(self):
        """Test that checking in the same visitor to the same service twice returns a 409 Conflict."""
        url = '/api/v1/attendance/scan/'
        data = {
            'code': self.visitor.registration_number,
            'service': str(self.service.id)
        }
        
        # First check-in (should succeed)
        response1 = self.client.post(url, data, format='json')
        self.assertEqual(response1.status_code, status.HTTP_201_CREATED)
        
        # Second check-in (should fail with 409 Conflict)
        response2 = self.client.post(url, data, format='json')
        self.assertEqual(response2.status_code, status.HTTP_409_CONFLICT)