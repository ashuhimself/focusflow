from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from django.db import connection


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create a UserProfile when a new User is created.
    New users are not approved by default (except superusers).
    """
    if created:
        from .models import UserProfile
        try:
            if 'user_profiles' in connection.introspection.table_names():
                UserProfile.objects.create(
                    user=instance,
                    is_approved=instance.is_superuser  # Auto-approve superusers
                )
        except Exception as e:
            print(f"UserProfile creation skipped: {e}")


@receiver(post_save, sender=User)
def create_workspace_for_user(sender, instance, created, **kwargs):
    """
    Automatically create a Workspace when a new User is created.
    Ensures every user has a workspace for multi-tenant isolation.
    """
    if created:
        # Check if the workspaces table exists before creating
        from .models import Workspace
        try:
            # Only create if table exists
            if 'workspaces' in connection.introspection.table_names():
                Workspace.objects.create(
                    user=instance,
                    name=f"{instance.username}'s Workspace"
                )
        except Exception as e:
            # Silently fail during migrations/initial setup
            print(f"Workspace creation skipped: {e}")


@receiver(post_save, sender=User)
def save_workspace_for_user(sender, instance, **kwargs):
    """
    Ensure workspace exists and is saved when user is updated.
    """
    try:
        if hasattr(instance, 'workspace'):
            instance.workspace.save()
    except Exception:
        # Silently fail if workspace doesn't exist
        pass
