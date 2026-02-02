from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.db import transaction, IntegrityError
from django.db.models import F, Sum, Q, Prefetch
from django.utils import timezone
from datetime import timedelta
from mptt.templatetags.mptt_tags import cache_tree_children

from .models import Post, Comment, Like, KarmaTransaction, UserProfile
from .serializers import (
    PostSerializer, PostListSerializer, CommentSerializer, 
    CommentCreateSerializer, LeaderboardUserSerializer
)


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PostListSerializer
        return PostSerializer
    
    def get_queryset(self):
        queryset = Post.objects.select_related('author')
        
        if self.action == 'retrieve':
            comments_prefetch = Prefetch(
                'comments',
                queryset=Comment.objects.select_related('author').order_by('tree_id', 'lft')
            )
            queryset = queryset.prefetch_related(comments_prefetch)
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        comments = list(instance.comments.all())
        cache_tree_children(comments)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        # For prototype: accept author from request data
        # In production, use: serializer.save(author=self.request.user)
        author_id = self.request.data.get('author')
        if author_id:
            author = User.objects.get(id=author_id)
            serializer.save(author=author)
        else:
            serializer.save()


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CommentCreateSerializer
        return CommentSerializer
    
    def get_queryset(self):
        return Comment.objects.select_related('author', 'post')
    
    def perform_create(self, serializer):
        # For prototype: accept author from request data
        author_id = self.request.data.get('author')
        if author_id:
            author = User.objects.get(id=author_id)
            serializer.save(author=author)
        else:
            serializer.save()


class LikeViewSet(viewsets.ViewSet):
    
    @action(detail=False, methods=['post'])
    def like_post(self, request):
        post_id = request.data.get('post_id')
        
        if not post_id:
            return Response({'error': 'post_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type = ContentType.objects.get_for_model(Post)
        
        try:
            with transaction.atomic():
                # For prototype: use testuser (ID: 2)
                user = User.objects.get(id=2)
                like, created = Like.objects.get_or_create(
                    user=user,
                    content_type=content_type,
                    object_id=post_id
                )
                
                if created:
                    Post.objects.filter(id=post_id).update(like_count=F('like_count') + 1)
                    
                    KarmaTransaction.objects.create(
                        user=post.author,
                        amount=5,
                        transaction_type='post_like',
                        content_type=content_type,
                        object_id=post_id
                    )
                    
                    UserProfile.objects.filter(user=post.author).update(
                        total_karma=F('total_karma') + 5
                    )
                    
                    return Response({'message': 'Post liked successfully'}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': 'Already liked'}, status=status.HTTP_200_OK)
                    
        except IntegrityError:
            return Response({'error': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def unlike_post(self, request):
        post_id = request.data.get('post_id')
        
        if not post_id:
            return Response({'error': 'post_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type = ContentType.objects.get_for_model(Post)
        user = User.objects.get(id=2)
        
        try:
            with transaction.atomic():
                like = Like.objects.filter(
                    user=user,
                    content_type=content_type,
                    object_id=post_id
                ).first()
                
                if like:
                    like.delete()
                    Post.objects.filter(id=post_id).update(like_count=F('like_count') - 1)
                    
                    # Remove karma transaction
                    KarmaTransaction.objects.filter(
                        user=post.author,
                        transaction_type='post_like',
                        content_type=content_type,
                        object_id=post_id
                    ).delete()
                    
                    UserProfile.objects.filter(user=post.author).update(
                        total_karma=F('total_karma') - 5
                    )
                    
                    return Response({'message': 'Post unliked successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Not liked yet'}, status=status.HTTP_200_OK)
                    
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def like_comment(self, request):
        comment_id = request.data.get('comment_id')
        
        if not comment_id:
            return Response({'error': 'comment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type = ContentType.objects.get_for_model(Comment)
        
        try:
            with transaction.atomic():
                # For prototype: use testuser (ID: 2)
                user = User.objects.get(id=2)
                like, created = Like.objects.get_or_create(
                    user=user,
                    content_type=content_type,
                    object_id=comment_id
                )
                
                if created:
                    Comment.objects.filter(id=comment_id).update(like_count=F('like_count') + 1)
                    
                    KarmaTransaction.objects.create(
                        user=comment.author,
                        amount=1,
                        transaction_type='comment_like',
                        content_type=content_type,
                        object_id=comment_id
                    )
                    
                    UserProfile.objects.filter(user=comment.author).update(
                        total_karma=F('total_karma') + 1
                    )
                    
                    return Response({'message': 'Comment liked successfully'}, status=status.HTTP_201_CREATED)
                else:
                    return Response({'message': 'Already liked'}, status=status.HTTP_200_OK)
                    
        except IntegrityError:
            return Response({'error': 'Already liked'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def unlike_comment(self, request):
        comment_id = request.data.get('comment_id')
        
        if not comment_id:
            return Response({'error': 'comment_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        content_type = ContentType.objects.get_for_model(Comment)
        user = User.objects.get(id=2)
        
        try:
            with transaction.atomic():
                like = Like.objects.filter(
                    user=user,
                    content_type=content_type,
                    object_id=comment_id
                ).first()
                
                if like:
                    like.delete()
                    Comment.objects.filter(id=comment_id).update(like_count=F('like_count') - 1)
                    
                    # Remove karma transaction
                    KarmaTransaction.objects.filter(
                        user=comment.author,
                        transaction_type='comment_like',
                        content_type=content_type,
                        object_id=comment_id
                    ).delete()
                    
                    UserProfile.objects.filter(user=comment.author).update(
                        total_karma=F('total_karma') - 1
                    )
                    
                    return Response({'message': 'Comment unliked successfully'}, status=status.HTTP_200_OK)
                else:
                    return Response({'message': 'Not liked yet'}, status=status.HTTP_200_OK)
                    
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LeaderboardView(APIView):
    
    def get(self, request):
        cutoff = timezone.now() - timedelta(hours=24)
        
        top_users = User.objects.annotate(
            karma_24h=Sum(
                'karma_transactions__amount',
                filter=Q(karma_transactions__created_at__gte=cutoff)
            )
        ).filter(
            karma_24h__isnull=False
        ).order_by('-karma_24h')[:5]
        
        serializer = LeaderboardUserSerializer(top_users, many=True)
        return Response(serializer.data)


class GetOrCreateUserView(APIView):
    """
    Get or create a user by username (for prototype without authentication)
    """
    def post(self, request):
        username = request.data.get('username')
        
        if not username:
            return Response({'error': 'username is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': f'{username}@example.com'}
        )
        
        # Ensure UserProfile exists
        UserProfile.objects.get_or_create(user=user)
        
        return Response({
            'id': user.id,
            'username': user.username,
            'created': created
        }, status=status.HTTP_200_OK)
