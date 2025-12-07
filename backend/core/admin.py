from django.contrib import admin
from django.utils import timezone
from .models import UserProfile, Workspace, Category, Track, Sprint, Task, DailyLog, DailyTodo


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_approved', 'approved_at', 'approved_by', 'created_at']
    list_filter = ['is_approved', 'created_at']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'approved_at', 'approved_by']
    actions = ['approve_users']

    def approve_users(self, request, queryset):
        """Bulk action to approve selected users."""
        count = 0
        for profile in queryset.filter(is_approved=False):
            profile.is_approved = True
            profile.approved_at = timezone.now()
            profile.approved_by = request.user
            profile.save()
            count += 1
        self.message_user(request, f'{count} user(s) successfully approved.')

    approve_users.short_description = "Approve selected users"


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'created_at']
    search_fields = ['user__username', 'name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'workspace', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ['title', 'workspace', 'category', 'progress_percentage', 'deadline', 'is_active']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'created_at'


@admin.register(Sprint)
class SprintAdmin(admin.ModelAdmin):
    list_display = ['name', 'track', 'start_date', 'end_date', 'is_active']
    list_filter = ['is_active', 'start_date']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'workspace', 'track', 'status', 'priority', 'estimated_hours', 'due_date']
    list_filter = ['status', 'priority', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'completed_at']
    date_hierarchy = 'created_at'


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    list_display = ['workspace', 'date', 'mood_score', 'energy_level', 'focus_hours']
    list_filter = ['date', 'mood_score']
    search_fields = ['notes']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'


@admin.register(DailyTodo)
class DailyTodoAdmin(admin.ModelAdmin):
    list_display = ['title', 'workspace', 'date', 'is_completed', 'created_at']
    list_filter = ['is_completed', 'date']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
