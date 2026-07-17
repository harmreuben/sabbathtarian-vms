import csv
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count
from django.db.models.functions import TruncDate

from apps.visitors.models import Visitor
from apps.attendance.models import Attendance

class DashboardStatsView(APIView):
    """
    Aggregates core statistics for the main dashboard.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Visitor Demographics (Gender)
        gender_data = Visitor.objects.values('gender').annotate(count=Count('gender'))
        gender_chart = [{"name": g['gender'] or 'Unknown', "value": g['count']} for g in gender_data]

        # 2. Visitor Types
        type_data = Visitor.objects.values('visitor_type').annotate(count=Count('visitor_type'))
        type_chart = [{"name": t['visitor_type'], "value": t['count']} for t in type_data]

        # 3. Growth Trend (Last 7 days of registrations)
        growth_data = Visitor.objects.annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(count=Count('id')).order_by('date')[:7]
        growth_chart = [{"date": str(g['date']), "visitors": g['count']} for g in growth_data]

        # 4. Top 5 Counties
        county_data = Visitor.objects.exclude(county='').values('county').annotate(count=Count('county')).order_by('-count')[:5]
        county_chart = [{"name": c['county'], "value": c['count']} for c in county_data]

        return Response({
            "total_visitors": Visitor.objects.count(),
            "total_attendance": Attendance.objects.count(),
            "charts": {
                "gender_distribution": gender_chart,
                "visitor_types": type_chart,
                "growth_trend": growth_chart,
                "top_counties": county_chart
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