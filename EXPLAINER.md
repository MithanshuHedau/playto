# Explainer: Technical Decisions & Implementation

## 1. The Tree (Threaded Comments)

**Modeling:**
We used **`django-mptt` (Modified Preorder Tree Traversal)** to model the nested comments. MPTT allows for efficient retrieval of entire trees in a single query by storing `lft` and `rght` values for each node.

**Serialization without killing the DB (N+1 Solution):**
The standard recursive approach causes an N+1 query problem (fetching replies for every single comment). To solve this:

1.  **Backend:** We fetch all comments for a post in **one query** using `prefetch_related` and `select_related`.
    ```python
    # views.py
    queryset = Post.objects.select_related('author')
    if self.action == 'retrieve':
        comments_prefetch = Prefetch(
            'comments',
            queryset=Comment.objects.select_related('author').order_by('tree_id', 'lft')
        )
        queryset = queryset.prefetch_related(comments_prefetch)
    ```
2.  **Caching:** We use `cache_tree_children(comments)` in the view's `retrieve` method. This MPTT utility takes the flat list of comments (fetched in one go) and reconstructs the tree structure in memory, populating the `parent` and `children` attributes without hitting the database again.
3.  **Serializer:** The `CommentSerializer` is recursive but uses the pre-fetched children from memory:
    ```python
    def get_replies(self, obj):
        # uses cached children if available, avoiding DB hits
        if hasattr(obj, 'prefetched_children'):
            children = obj.prefetched_children
        else:
            children = obj.get_children()
        return CommentSerializer(children, many=True).data
    ```

## 2. The Math (24h Leaderboard)

The leaderboard calculates the total karma earned by users specifically in the **last 24 hours**. We do not store a "daily karma" field on the user model because it changes every second. Instead, we aggregate it dynamically from the `KarmaTransaction` ledger.

**The QuerySet:**

```python
cutoff = timezone.now() - timedelta(hours=24)

top_users = User.objects.annotate(
    karma_24h=Sum(
        'karma_transactions__amount',
        filter=Q(karma_transactions__created_at__gte=cutoff)
    )
).filter(
    karma_24h__isnull=False
).order_by('-karma_24h')[:5]
```

**SQL Equivalent (approximate):**

```sql
SELECT
    auth_user.id,
    auth_user.username,
    SUM(api_karmatransaction.amount) as karma_24h
FROM
    auth_user
LEFT OUTER JOIN
    api_karmatransaction ON (auth_user.id = api_karmatransaction.user_id)
WHERE
    api_karmatransaction.created_at >= '2025-02-01 14:00:00'  -- 24 hours ago
GROUP BY
    auth_user.id
ORDER BY
    karma_24h DESC
LIMIT 5;
```

## 3. The AI Audit

**Issue:**
Initially, the AI implementation for the `PostViewSet` and `CommentViewSet` relied on `self.request.user` to assign the author of a piece of content.

**The Bug:**
Since this is a prototype where we want to simulate multiple users easily without a complex login/logout flow, using `request.user` would mean every post is created by "AnonymousUser" (which fails) or the currently logged-in admin (which limits testing). It prevented the core requirement of distinct user identities in the feed.

**The Fix:**
I modified `perform_create` in the views to accept an explicit `author` ID from the request body.

```python
def perform_create(self, serializer):
    # CHANGED: Accept explicit author from request payload for prototype flexibility
    # This allows the frontend "Enter Username" feature to work dynamically
    author_id = self.request.data.get('author')
    if author_id:
        author = User.objects.get(id=author_id)
        serializer.save(author=author)
    else:
        serializer.save()
```

This change, paired with the `GetOrCreateUserView` and the frontend username input, allowed for a seamless multi-user simulation experience.
