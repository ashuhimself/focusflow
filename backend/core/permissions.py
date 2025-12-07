"""
Custom permissions for FocusFlow.
Ensures multi-tenant isolation at the workspace level.
"""
from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        return obj.workspace.user == request.user


class BelongsToUserWorkspace(permissions.BasePermission):
    """
    Ensure the object belongs to the user's workspace.
    Critical for multi-tenant data isolation.
    """

    def has_permission(self, request, view):
        """Check if user has a workspace."""
        return hasattr(request.user, 'workspace')

    def has_object_permission(self, request, view, obj):
        """Check if object belongs to user's workspace."""
        # For Workspace objects, check if user owns it
        if hasattr(obj, 'user'):
            return obj.user == request.user

        # For Sprint objects (which have track.workspace)
        if hasattr(obj, 'track') and hasattr(obj.track, 'workspace'):
            return obj.track.workspace.user == request.user

        # For other objects, check workspace ownership
        if hasattr(obj, 'workspace'):
            return obj.workspace.user == request.user

        return False
