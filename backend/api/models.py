from django.db import models
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta
from mptt.models import MPTTModel, TreeForeignKey


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    total_karma = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def get_24h_karma(self):
        cutoff = timezone.now() - timedelta(hours=24)
        result = self.user.karma_transactions.filter(
            created_at__gte=cutoff
        ).aggregate(total=Sum('amount'))
        return result['total'] or 0
    
    def __str__(self):
        return f"{self.user.username} - {self.total_karma} karma"


class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    like_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['created_at'])]
    
    def __str__(self):
        return f"Post by {self.author.username}: {self.content[:50]}"


class Comment(MPTTModel):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    like_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class MPTTMeta:
        order_insertion_by = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author.username} on {self.post.id}"


class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'content_type', 'object_id')
        indexes = [models.Index(fields=['content_type', 'object_id'])]
    
    def __str__(self):
        return f"{self.user.username} likes {self.content_type} {self.object_id}"


class KarmaTransaction(models.Model):
    TRANSACTION_TYPES = [
        ('post_like', 'Post Like'),
        ('comment_like', 'Comment Like'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='karma_transactions')
    amount = models.IntegerField()
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['user', 'created_at'])]
    
    def __str__(self):
        return f"{self.user.username} earned {self.amount} karma from {self.transaction_type}"
