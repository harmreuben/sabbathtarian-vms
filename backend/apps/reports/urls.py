from django.urls import path
from .views import DashboardStatsView, ExportVisitorsView

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('export/visitors/', ExportVisitorsView.as_view(), name='export-visitors'),
]