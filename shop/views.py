from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Category, Product, Cart, CartItem, Order, OrderItem
from .forms import UserRegistrationForm, OrderForm
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST

def home(request):
    # Get all categories
    categories = Category.objects.all()
    
    # Get new products (latest 4)
    new_products = Product.objects.filter(
        available=True
    ).order_by('-created')[:4]
    
    # Get top selling products (you might want to implement your own logic here)
    top_sellers = Product.objects.filter(
        available=True
    ).order_by('?')[:4]  # Random selection for now
    
    return render(request, 'shop/index.html', {
        'categories': categories,
        'new_products': new_products,
        'top_sellers': top_sellers,
    })

def category_list(request):
    categories = Category.objects.all()
    return render(request, 'shop/category_list.html', {
        'categories': categories,
        'title': 'Categories'
    })

def category_detail(request, category_id):
    category = get_object_or_404(Category, id=category_id)
    products = Product.objects.filter(category=category)
    return render(request, 'shop/category_detail.html', {
        'category': category,
        'products': products
    })

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'shop/product_detail.html', {'product': product})

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')

        if password1 != password2:
            messages.error(request, 'Паролі не співпадають')
            return redirect('shop:register')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Користувач з таким іменем вже існує')
            return redirect('shop:register')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Користувач з таким email вже існує')
            return redirect('shop:register')

        user = User.objects.create_user(username=username, email=email, password=password1)
        login(request, user)
        messages.success(request, 'Реєстрація успішна!')
        return redirect('shop:home')

    return render(request, 'shop/register.html')

def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('shop:home')
        else:
            messages.error(request, 'Invalid username or password')
    return render(request, 'shop/login.html')

def logout_view(request):
    logout(request)
    return redirect('shop:home')

@login_required
def profile(request):
    user = request.user
    orders = Order.objects.filter(user=user)
    return render(request, 'shop/profile.html', {
        'user': user,
        'orders': orders
    })

@login_required
def cart_detail(request):
    cart = get_object_or_404(Cart, user=request.user)
    return render(request, 'shop/cart.html', {'cart': cart})

@login_required
def add_to_cart(request):
    if request.method == 'POST':
        try:
            product_id = request.POST.get('product_id')
            quantity = int(request.POST.get('quantity', 1))
            
            product = get_object_or_404(Product, id=product_id)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )
            
            if not created:
                cart_item.quantity += quantity
                cart_item.save()
            
            return JsonResponse({
                'success': True,
                'cart_count': cart.get_total_items()
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            })
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def remove_from_cart(request, item_id):
    try:
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.delete()
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'success': False, 'message': str(e)})

@login_required
def update_cart_item(request, item_id):
    if request.method == 'POST':
        try:
            quantity = int(request.POST.get('quantity', 1))
            cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
            cart_item.quantity = quantity
            cart_item.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def quick_view(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        return JsonResponse({
            'success': True,
            'product': {
                'id': product.id,
                'name': product.name,
                'price': str(product.price),
                'description': product.description,
                'image': product.image.url if product.image else None
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

@login_required
def order_list(request):
    orders = Order.objects.filter(user=request.user)
    return render(request, 'shop/order_list.html', {'orders': orders})

@login_required
def order_detail(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    return render(request, 'shop/order_detail.html', {'order': order})

def search(request):
    query = request.GET.get('q', '')
    products = Product.objects.filter(name__icontains=query)
    return render(request, 'shop/search.html', {
        'products': products,
        'query': query
    })

def product_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(available=True)
    
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)
    
    return render(request, 'shop/product_list.html', {
        'category': category,
        'categories': categories,
        'products': products
    })

@login_required
def cart_add(request, product_id):
    if request.method == 'POST':
        try:
            product = get_object_or_404(Product, id=product_id)
            cart, created = Cart.objects.get_or_create(user=request.user)
            
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': 1}
            )
            
            if not created:
                cart_item.quantity += 1
                cart_item.save()
            
            return JsonResponse({
                'success': True,
                'cart_count': cart.get_total_items()
            })
        except Exception as e:
            return JsonResponse({
                'success': False,
                'message': str(e)
            })
    return JsonResponse({'success': False, 'message': 'Invalid request method'})

@login_required
def cart_remove(request, product_id):
    try:
        product = get_object_or_404(Product, id=product_id)
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, cart=cart, product=product)
        
        if cart_item.quantity > 1:
            cart_item.quantity -= 1
            cart_item.save()
        else:
            cart_item.delete()
        
        return JsonResponse({
            'success': True,
            'cart_count': cart.get_total_items()
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': str(e)
        })

@login_required
def cart_count(request):
    try:
        cart = Cart.objects.get(user=request.user)
        return JsonResponse({'count': cart.get_total_items()})
    except Cart.DoesNotExist:
        return JsonResponse({'count': 0})

def index(request):
    featured_products = Product.objects.filter(available=True)[:6]
    categories = Category.objects.all()
    return render(request, 'shop/index.html', {
        'featured_products': featured_products,
        'categories': categories
    })

def product_list(request, category_slug=None):
    category = None
    categories = Category.objects.all()
    products = Product.objects.filter(available=True)
    
    if category_slug:
        category = get_object_or_404(Category, slug=category_slug)
        products = products.filter(category=category)
    
    return render(request, 'shop/product/list.html', {
        'category': category,
        'categories': categories,
        'products': products
    })

def product_detail(request, id, slug):
    product = get_object_or_404(Product, id=id, slug=slug, available=True)
    return render(request, 'shop/product/detail.html', {'product': product})

def blog_list(request):
    posts = [
        {
            'slug': 'planting-tips',
            'title': 'Як правильно садити рослини',
            'content': 'Детальний посібник з посадки різних видів рослин...',
            'image': 'images/tips/planting.jpg'
        },
        {
            'slug': 'seasonal-care',
            'title': 'Сезонний догляд за садом',
            'content': 'Календар робіт у саду по місяцях...',
            'image': 'images/tips/care.jpg'
        },
        {
            'slug': 'pest-control',
            'title': 'Боротьба зі шкідниками',
            'content': 'Ефективні методи захисту рослин від шкідників...',
            'image': 'images/tips/pests.jpg'
        }
    ]
    return render(request, 'shop/blog/list.html', {'posts': posts})

def blog_detail(request, slug):
    posts = {
        'planting-tips': {
            'title': 'Як правильно садити рослини',
            'content': 'Детальний посібник з посадки різних видів рослин...',
            'image': 'images/tips/planting.jpg'
        },
        'seasonal-care': {
            'title': 'Сезонний догляд за садом',
            'content': 'Календар робіт у саду по місяцях...',
            'image': 'images/tips/care.jpg'
        },
        'pest-control': {
            'title': 'Боротьба зі шкідниками',
            'content': 'Ефективні методи захисту рослин від шкідників...',
            'image': 'images/tips/pests.jpg'
        }
    }
    post = posts.get(slug)
    if not post:
        return render(request, 'shop/404.html', status=404)
    return render(request, 'shop/blog/detail.html', {'post': post})

@login_required
def cart_detail(request):
    cart = Cart.objects.get_or_create(user=request.user)[0]
    return render(request, 'shop/cart/detail.html', {'cart': cart})

@require_POST
@login_required
def cart_add(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart = Cart.objects.get_or_create(user=request.user)[0]
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    return JsonResponse({'status': 'ok'})

@require_POST
@login_required
def cart_remove(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart = Cart.objects.get(user=request.user)
    CartItem.objects.filter(cart=cart, product=product).delete()
    return JsonResponse({'status': 'ok'})

@login_required
def order_create(request):
    cart = Cart.objects.get(user=request.user)
    if request.method == 'POST':
        order = Order.objects.create(
            user=request.user,
            first_name=request.POST['first_name'],
            last_name=request.POST['last_name'],
            email=request.POST['email'],
            address=request.POST['address'],
            postal_code=request.POST['postal_code'],
            city=request.POST['city'],
            total=cart.get_total_price()
        )
        for item in cart.cartitem_set.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                price=item.product.get_discounted_price(),
                quantity=item.quantity
            )
        cart.cartitem_set.all().delete()
        messages.success(request, 'Ваше замовлення успішно створено!')
        return redirect('shop:order_detail', order.id)
    return render(request, 'shop/order/create.html', {'cart': cart})

def main_page(request):
    return render(request, 'zvit_main/index.html')
