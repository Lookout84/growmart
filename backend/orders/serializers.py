from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductListSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'price', 'quantity', 'total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'order_number', 'status', 'subtotal', 'shipping_cost', 
                 'tax', 'total', 'payment_method', 'is_paid', 'paid_at',
                 'delivery_method', 'first_name', 'last_name', 'email', 'phone',
                 'address', 'city', 'postal_code', 'country', 'notes', 
                 'tracking_number', 'items', 'created_at', 'updated_at']
        read_only_fields = ['order_number', 'user', 'is_paid', 'paid_at', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['payment_method', 'delivery_method', 'first_name', 'last_name',
                 'email', 'phone', 'address', 'city', 'postal_code', 'country', 'notes']
