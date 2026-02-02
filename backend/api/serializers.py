from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like, KarmaTransaction, UserProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'like_count', 'created_at', 'level', 'replies']
        read_only_fields = ['like_count', 'created_at', 'level']
    
    def get_replies(self, obj):
        if hasattr(obj, 'prefetched_children'):
            children = obj.prefetched_children
        else:
            children = obj.get_children()
        
        if children:
            return CommentSerializer(children, many=True).data
        return []


class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comments = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'like_count', 'created_at', 'updated_at', 'comments']
        read_only_fields = ['like_count', 'created_at', 'updated_at']
    
    def get_comments(self, obj):
        root_comments = obj.comments.filter(parent=None)
        return CommentSerializer(root_comments, many=True).data


class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'like_count', 'comment_count', 'created_at']
        read_only_fields = ['like_count', 'created_at']
    
    def get_comment_count(self, obj):
        return obj.comments.count()


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['post', 'parent', 'content']
    
    def validate(self, data):
        if data.get('parent') and data.get('post'):
            if data['parent'].post != data['post']:
                raise serializers.ValidationError("Parent comment must belong to the same post")
        return data


class LeaderboardUserSerializer(serializers.ModelSerializer):
    karma_24h = serializers.IntegerField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'karma_24h']
