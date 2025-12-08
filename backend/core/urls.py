"""
URL routing for FocusFlow core API endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'workspaces', views.WorkspaceViewSet, basename='workspace')
router.register(r'tracks', views.TrackViewSet, basename='track')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'sprints', views.SprintViewSet, basename='sprint')
router.register(r'tasks', views.TaskViewSet, basename='task')
router.register(r'daily-logs', views.DailyLogViewSet, basename='dailylog')
router.register(r'daily-todos', views.DailyTodoViewSet, basename='dailytodo')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),

    # Custom endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/me/', views.current_user, name='current-user'),
    path('auth/password-reset/', views.password_reset_request, name='password-reset'),
    path('auth/password-reset/confirm/', views.password_reset_confirm, name='password-reset-confirm'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard-stats'),

    # Custom token endpoint with approval check
    path('token/', views.custom_token_obtain, name='token_obtain'),
]
