import { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const [userReview, setUserReview] = useState<Review | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // First get reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      // Then get profiles for each review
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', review.user_id)
            .single();
          
          return {
            ...review,
            profiles: profile || { full_name: 'Anonymous' }
          };
        })
      );

      setReviews(reviewsWithProfiles);
      setUserReview(reviewsWithProfiles.find(r => r.user_id === user?.id) || null);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async () => {
    if (!user || newReview.rating === 0) return;

    try {
      const reviewData = {
        product_id: productId,
        user_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment.trim() || null,
      };

      let result;
      if (userReview) {
        result = await supabase
          .from('reviews')
          .update(reviewData)
          .eq('id', userReview.id);
      } else {
        result = await supabase
          .from('reviews')
          .insert(reviewData);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: userReview ? "Review updated successfully" : "Review submitted successfully",
      });

      setNewReview({ rating: 0, comment: '' });
      setShowReviewForm(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    fetchReviews();
  }, [productId, user]);

  useEffect(() => {
    if (userReview && showReviewForm) {
      setNewReview({
        rating: userReview.rating,
        comment: userReview.comment || '',
      });
    }
  }, [userReview, showReviewForm]);

  const renderStars = (rating: number, interactive = false, onStarClick?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground'
            } ${interactive ? 'cursor-pointer hover:text-warning' : ''}`}
            onClick={() => interactive && onStarClick?.(star)}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="card-minimal">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Reviews ({reviews.length})
          </CardTitle>
          {averageRating > 0 && (
            <div className="flex items-center gap-2">
              {renderStars(Math.round(averageRating))}
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {user && (
          <div className="space-y-4">
            {!showReviewForm ? (
              <Button 
                variant="outline" 
                onClick={() => setShowReviewForm(true)}
                className="w-full"
              >
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </Button>
            ) : (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Rating</label>
                  {renderStars(newReview.rating, true, (rating) => 
                    setNewReview(prev => ({ ...prev, rating }))
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Comment (optional)</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this product..."
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={submitReview}
                    disabled={newReview.rating === 0}
                    size="sm"
                  >
                    {userReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview({ rating: 0, comment: '' });
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No reviews yet. Be the first to review this product!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-sm font-medium">
                        {review.profiles?.full_name || 'Anonymous'}
                      </span>
                      {review.user_id === user?.id && (
                        <Badge variant="secondary" className="text-xs">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductReviews;