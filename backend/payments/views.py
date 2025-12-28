from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Payment
from orders.models import Order
from .serializers import PaymentSerializer


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return Payment.objects.all()
        return Payment.objects.filter(order__user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def create_payment(self, request):
        """Create payment for order"""
        order_id = request.data.get('order_id')
        
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Замовлення не знайдено'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if hasattr(order, 'payment'):
            return Response({'error': 'Платіж вже створено для цього замовлення'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        payment = Payment.objects.create(
            order=order,
            amount=order.total,
            payment_method=order.payment_method
        )
        
        # Here you would integrate with payment gateway (Stripe, etc.)
        # For now, we'll just mark it as completed
        payment.status = 'completed'
        payment.transaction_id = f"TXN-{payment.id}"
        payment.save()
        
        order.is_paid = True
        from django.utils import timezone
        order.paid_at = timezone.now()
        order.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
