from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Cart, CartItem, Order, OrderItem

@receiver(post_save, sender=CartItem)
def update_cart_total(sender, instance, **kwargs):
    cart = instance.cart
    cart_items = CartItem.objects.filter(cart=cart)
    cart.total_price = sum(item.product.price * item.quantity for item in cart_items)
    cart.save()

@receiver(post_save, sender=OrderItem)
def update_order_total(sender, instance, **kwargs):
    order = instance.order
    order_items = OrderItem.objects.filter(order=order)
    order.total = sum(item.price * item.quantity for item in order_items)
    order.save() 