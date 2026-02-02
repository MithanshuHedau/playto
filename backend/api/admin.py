from django.contrib import admin
from mptt.admin import MPTTModelAdmin
from .models import UserProfile, Post, Comment, Like, KarmaTransaction


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_karma', 'created_at')
    search_fields = ('user__username',)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'content_preview', 'like_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'content')
    
    def content_preview(self, obj):
        return obj.content[:50]


@admin.register(Comment)
class CommentAdmin(MPTTModelAdmin):
    list_display = ('author', 'post', 'content_preview', 'like_count', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('author__username', 'content')
    mptt_level_indent = 20
    
    def content_preview(self, obj):
        return obj.content[:50]


@admin.register(Like)
class LikeAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_type', 'object_id', 'created_at')
    list_filter = ('content_type', 'created_at')
    search_fields = ('user__username',)


@admin.register(KarmaTransaction)
class KarmaTransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'transaction_type', 'created_at')
    list_filter = ('transaction_type', 'created_at')
    search_fields = ('user__username',)
