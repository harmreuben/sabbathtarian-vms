import csv
from datetime import timedelta
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q
from django.db.models.functions import TruncDate, TruncHour

from apps.visitors.models import Visitor
from apps.attendance.models import Attendance, ScanLog

class DashboardStatsView(APIView):
    """
    Aggregates core statistics for the main dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        start_of_week = today - timedelta(days=today.weekday()) # Monday
        
        # 1. Visitor Demographics
        gender_data = Visitor.objects.values('gender').annotate(count=Count('gender'))
        gender_chart = [{"name": g['gender'] or 'Unknown', "value": g['count']} for g in gender_data]

        type_data = Visitor.objects.values('visitor_type').annotate(count=Count('visitor_type'))
        type_chart = [{"name": t['visitor_type'], "value": t['count']} for t in type_data]

        growth_data = Visitor.objects.filter(created_at__date__gte=start_of_week).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(count=Count('id')).order_by('date')
        growth_chart = [{"date": str(g['date']), "visitors": g['count']} for g in growth_data]

        county_data = Visitor.objects.exclude(county='').values('county').annotate(count=Count('county')).order_by('-count')[:5]
        county_chart = [{"name": c['county'], "value": c['count']} for c in county_data]

        # 2. Today's Attendance & Security Metrics
        todays_attendances = Attendance.objects.filter(check_in_time__date=today)
        
        # Peak arrival hours (e.g., 9 AM, 10 AM)
        peak_hours_data = todays_attendances.annotate(
            hour=TruncHour('check_in_time')
        ).values('hour').annotate(count=Count('id')).order_by('-count')[:3]
        peak_hours = [f"{h['hour'].strftime('%I:00 %p')}" for h in peak_hours_data]

        # Scan logs for today
        todays_scans = ScanLog.objects.filter(scanned_at__date=today)
        scan_stats = todays_scans.values('status').annotate(count=Count('status'))
        
        scan_summary = {
            "success": 0,
            "duplicate": 0,
            "invalid": 0,
            "revoked": 0
        }
        for stat in scan_stats:
            scan_summary[stat['status'].lower()] = stat['count']

        return Response({
            "total_visitors": Visitor.objects.count(),
            "total_attendance": Attendance.objects.count(),
            "charts": {
                "gender_distribution": gender_chart,
                "visitor_types": type_chart,
                "growth_trend": growth_chart,
                "top_counties": county_chart
            },
            "today": {
                "check_ins": todays_attendances.count(),
                "first_time": todays_attendances.filter(visitor__visitor_type='First Time').count(),
                "returning": todays_attendances.filter(visitor__visitor_type='Returning').count(),
                "peak_hours": peak_hours,
                "scans": scan_summary
            }
        })

class ExportVisitorsView(APIView):
    """
    Streams all visitors as a CSV file.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="visitors_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Reg Number', 'Full Name', 'Gender', 'Phone', 'County', 'Visitor Type', 'Date Registered'])

        visitors = Visitor.objects.all().order_by('-created_at')
        for v in visitors:
            writer.writerow([
                v.registration_number,
                v.full_name,
                v.gender,
                v.phone_number,
                v.county,
                v.visitor_type,
                v.created_at.strftime('%Y-%m-%d')
            ])

        return response