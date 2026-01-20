package com.example.service;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final UserService userService;
    private final ProductService productService;

    public CartService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            UserService userService,
            ProductService productService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.userService = userService;
        this.productService = productService;
    }

    // Get or create active cart
    public Cart getActiveCart(Integer userId) {
        User user = userService.getUserById(userId);

        return cartRepository.findByUserAndIsActive(user, 'Y')
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    cart.setIsActive('Y');
                    return cartRepository.save(cart);
                });
    }

    // Add item to cart
    public Cartitem addToCart(Integer userId, Integer productId, Integer qty) {

        Cart cart = getActiveCart(userId);
        Product product = productService.getProductById(productId);

        // check if item already exists
        Cartitem item = cartItemRepository
                .findByCartAndProd(cart, product)
                .orElse(new Cartitem());

        item.setCart(cart);
        item.setProd(product);
        item.setQuantity(
                item.getQuantity() == null ? qty : item.getQuantity() + qty
        );
        item.setPriceSnapshot(product.getCardholderPrice());

        return cartItemRepository.save(item);
    }

    // Remove item
    public void removeItem(Integer cartItemId) {
        cartItemRepository.deleteById(cartItemId);
    }
}
