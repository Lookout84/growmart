from rest_framework import serializers
from .models import Category, Product, ProductImage, ProductVariant, Review, Banner, BlogPost, BlogCategory, Wishlist
from .utils import generate_product_description
from .image_utils import add_images_to_product


class CategorySerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'parent', 'is_active']
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'name', 'price', 'stock', 'sort_order', 'is_active']


class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    user_display = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_display', 'rating', 'title', 'comment',
                 'is_verified_purchase', 'status', 'created_at']

    def get_user_display(self, obj):
        return obj.user.get_full_name() or obj.user.username


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'short_description', 'price', 
                 'old_price', 'discount_percentage', 'final_price', 'stock', 
                 'in_stock', 'is_featured', 'is_new', 'primary_image', 'variants']
    
    def get_primary_image(self, obj):
        request = self.context.get('request')
        primary = obj.images.filter(is_primary=True).first()
        image = primary or obj.images.first()
        if not image:
            return None
        url = image.image.url
        return request.build_absolute_uri(url) if request else url


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    variants = ProductVariantSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'category', 'description', 'short_description',
                 'price', 'old_price', 'discount_percentage', 'final_price', 'stock',
                 'sku', 'brand', 'weight', 'in_stock', 'is_featured', 'is_new',
                 'images', 'reviews', 'variants', 'average_rating', 'review_count', 'created_at']

    def get_reviews(self, obj):
        approved = obj.reviews.filter(status='approved').select_related('user')
        return ReviewSerializer(approved, many=True).data

    def get_average_rating(self, obj):
        reviews = obj.reviews.filter(status='approved')
        if reviews.exists():
            return round(sum(r.rating for r in reviews) / reviews.count(), 1)
        return 0

    def get_review_count(self, obj):
        return obj.reviews.filter(status='approved').count()


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['product', 'rating', 'title', 'comment']

    def validate_comment(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError('Відгук має містити щонайменше 10 символів')
        return value.strip()

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data)


class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ['id', 'title', 'subtitle', 'image', 'link', 'button_text', 'order']


class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = ['id', 'name', 'slug', 'description', 'is_active']


class BlogPostSerializer(serializers.ModelSerializer):
    category = BlogCategorySerializer(read_only=True)
    author = serializers.StringRelatedField()
    
    class Meta:
        model = BlogPost
        fields = ['id', 'title', 'slug', 'excerpt', 'content', 'featured_image',
                 'category', 'author', 'created_at', 'updated_at']


class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'product', 'created_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Серіалізатор для створення товарів з автогенерацією опису та зображень"""
    auto_generate_description = serializers.BooleanField(
        default=True, 
        write_only=True,
        help_text="Автоматично згенерувати опис за допомогою AI"
    )
    auto_add_images = serializers.BooleanField(
        default=False,
        write_only=True,
        help_text="Автоматично знайти та додати зображення"
    )
    image_count = serializers.IntegerField(
        default=3,
        write_only=True,
        min_value=1,
        max_value=10,
        help_text="Кількість зображень для пошуку (1-10)"
    )
    use_dalle = serializers.BooleanField(
        default=False,
        write_only=True,
        help_text="Генерувати зображення через DALL-E (OpenAI)"
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'category', 'description', 'short_description',
            'price', 'old_price', 'discount_percentage', 'variety', 'age',
            'fruit_weight', 'ripening_time', 'planting_season', 'package_type',
            'stock', 'sku', 'brand', 'weight', 'is_active', 'is_featured',
            'is_new', 'is_popular', 'is_in_stock', 'is_promo', 'delivery_info',
            'meta_title', 'meta_description', 'auto_generate_description',
            'auto_add_images', 'image_count', 'use_dalle'
        ]
        extra_kwargs = {
            'description': {'required': False, 'allow_blank': True},
            'short_description': {'required': False, 'allow_blank': True},
            'slug': {'required': False, 'allow_blank': True},
            'sku': {'required': False, 'allow_blank': True},
        }
    
    def create(self, validated_data):
        # Витягуємо параметри автогенерації
        auto_generate = validated_data.pop('auto_generate_description', True)
        auto_add_images = validated_data.pop('auto_add_images', False)
        image_count = validated_data.pop('image_count', 3)
        use_dalle = validated_data.pop('use_dalle', False)
        
        # Перевіряємо чи потрібна автогенерація опису
        if auto_generate and not validated_data.get('description'):
            product_name = validated_data.get('name')
            category = validated_data.get('category')
            category_name = category.name if category else None
            
            # Генеруємо опис
            description, short_description = generate_product_description(
                product_name=product_name,
                category_name=category_name,
                use_ai=True
            )
            
            # Встановлюємо згенеровані описи якщо вони не були надані
            if not validated_data.get('description'):
                validated_data['description'] = description
            if not validated_data.get('short_description'):
                validated_data['short_description'] = short_description
        
        # Створюємо товар
        product = super().create(validated_data)
        
        # Додаємо зображення якщо потрібно
        if auto_add_images:
            try:
                added_count = add_images_to_product(
                    product=product,
                    image_count=image_count,
                    use_ai=True,
                    use_dalle=use_dalle
                )
                if added_count > 0:
                    # Оновлюємо продукт щоб підвантажити зображення
                    product.refresh_from_db()
            except Exception as e:
                # Логуємо помилку але не падаємо
                import logging
                logger = logging.getLogger(__name__)
                logger.error(f"Помилка при додаванні зображень: {str(e)}")
        
        return product
    
    def update(self, instance, validated_data):
        # Видаляємо параметри автогенерації з validated_data
        validated_data.pop('auto_generate_description', None)
        validated_data.pop('auto_add_images', None)
        validated_data.pop('image_count', None)
        validated_data.pop('use_dalle', None)
        return super().update(instance, validated_data)
