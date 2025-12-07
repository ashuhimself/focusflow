from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class UserProfile(models.Model):
    """
    Extended user profile with approval status.
    New users must be approved by admin before they can log in.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_users'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'

    def __str__(self):
        return f"{self.user.username} - {'Approved' if self.is_approved else 'Pending'}"


class Workspace(models.Model):
    """
    One-to-one workspace for each user. All data belongs to a workspace.
    Multi-tenant isolation at the workspace level.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='workspace',
        primary_key=True
    )
    name = models.CharField(max_length=255, default='My Workspace')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workspaces'
        verbose_name = 'Workspace'
        verbose_name_plural = 'Workspaces'

    def __str__(self):
        return f"{self.user.username}'s Workspace"


class Category(models.Model):
    """
    User-defined categories for organizing tracks.
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'categories'
        verbose_name = 'Category'
        verbose_name_plural = 'Categories'
        ordering = ['name']
        indexes = [
            models.Index(fields=['workspace']),
        ]

    def __str__(self):
        return self.name


class Track(models.Model):
    """
    High-level objectives (e.g., "Master AWS", "Learn Django").
    Tracks progress and has a deadline.
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='tracks'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='tracks'
    )
    progress_percentage = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tracks'
        verbose_name = 'Track'
        verbose_name_plural = 'Tracks'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['workspace', 'category']),
            models.Index(fields=['workspace', 'is_active']),
        ]

    def __str__(self):
        return f"{self.title} ({self.category.name if self.category else 'No Category'})"

    def update_progress(self):
        """
        Auto-calculate progress based on completed tasks.
        """
        total_tasks = self.tasks.count()
        if total_tasks == 0:
            self.progress_percentage = 0
        else:
            completed_tasks = self.tasks.filter(status=Task.StatusChoices.DONE).count()
            self.progress_percentage = int((completed_tasks / total_tasks) * 100)
        self.save()


class Sprint(models.Model):
    """
    A 2-week period linked to a Track for focused execution.
    """
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name='sprints'
    )
    name = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'sprints'
        verbose_name = 'Sprint'
        verbose_name_plural = 'Sprints'
        ordering = ['-start_date']
        indexes = [
            models.Index(fields=['track', 'is_active']),
            models.Index(fields=['start_date', 'end_date']),
        ]

    def __str__(self):
        return f"{self.name} ({self.start_date} - {self.end_date})"

    @property
    def duration_days(self):
        """Returns the sprint duration in days."""
        return (self.end_date - self.start_date).days + 1

    @property
    def is_current(self):
        """Check if sprint is currently active based on dates."""
        today = timezone.now().date()
        return self.start_date <= today <= self.end_date


class Task(models.Model):
    """
    Actionable items linked to a Track or Sprint.
    Core execution unit in the system.
    """

    class StatusChoices(models.TextChoices):
        TODO = 'TODO', 'To Do'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        DONE = 'DONE', 'Done'

    class PriorityChoices(models.TextChoices):
        HIGH = 'HIGH', 'High'
        MEDIUM = 'MEDIUM', 'Medium'
        LOW = 'LOW', 'Low'

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='tasks'
    )
    track = models.ForeignKey(
        Track,
        on_delete=models.CASCADE,
        related_name='tasks',
        null=True,
        blank=True
    )
    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.SET_NULL,
        related_name='tasks',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=StatusChoices.choices,
        default=StatusChoices.TODO
    )
    priority = models.CharField(
        max_length=20,
        choices=PriorityChoices.choices,
        default=PriorityChoices.MEDIUM
    )
    estimated_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    actual_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)]
    )
    due_date = models.DateField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tasks'
        verbose_name = 'Task'
        verbose_name_plural = 'Tasks'
        ordering = ['-priority', '-created_at']
        indexes = [
            models.Index(fields=['workspace', 'status']),
            models.Index(fields=['track', 'status']),
            models.Index(fields=['sprint', 'status']),
            models.Index(fields=['priority', 'status']),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def save(self, *args, **kwargs):
        """Auto-set completed_at when status changes to DONE."""
        if self.status == self.StatusChoices.DONE and not self.completed_at:
            self.completed_at = timezone.now()
        elif self.status != self.StatusChoices.DONE:
            self.completed_at = None

        super().save(*args, **kwargs)

        # Update track progress if linked to a track
        if self.track:
            self.track.update_progress()


class DailyLog(models.Model):
    """
    Date-based journal entry for tracking daily progress, mood, and habits.
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='daily_logs'
    )
    date = models.DateField()
    mood_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True,
        blank=True
    )
    notes = models.TextField(blank=True, null=True)
    habits_completed = models.JSONField(
        default=list,
        blank=True,
        help_text="List of habit names or IDs completed on this day"
    )
    energy_level = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True,
        blank=True
    )
    focus_hours = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
        help_text="Total focused work hours for the day"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_logs'
        verbose_name = 'Daily Log'
        verbose_name_plural = 'Daily Logs'
        ordering = ['-date']
        unique_together = ['workspace', 'date']
        indexes = [
            models.Index(fields=['workspace', 'date']),
        ]

    def __str__(self):
        return f"Log for {self.date} (Mood: {self.mood_score or 'N/A'})"


class DailyTodo(models.Model):
    """
    Daily todo items - simple tasks for the day.
    """
    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='daily_todos'
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    is_completed = models.BooleanField(default=False)
    date = models.DateField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'daily_todos'
        verbose_name = 'Daily Todo'
        verbose_name_plural = 'Daily Todos'
        ordering = ['-date', 'is_completed', 'created_at']
        indexes = [
            models.Index(fields=['workspace', 'date']),
            models.Index(fields=['workspace', 'is_completed']),
        ]

    def __str__(self):
        status = "✓" if self.is_completed else "○"
        return f"{status} {self.title} ({self.date})"
