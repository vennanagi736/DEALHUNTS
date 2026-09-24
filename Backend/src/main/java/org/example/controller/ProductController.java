package org.example.controller;

import java.util.List;

import org.example.dto.ProductCardDTO;
import org.example.dto.ProductDetailsDTO;
import org.example.entity.Brand;
import org.example.entity.Category;
import org.example.entity.Color;
import org.example.entity.Product;
import org.example.entity.Variant;
import org.example.repository.BrandRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.ColorRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VariantRepository;
import org.example.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final ColorRepository colorRepository;
    private final VariantRepository variantRepository;

    public ProductController(
            ProductService productService,
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            ColorRepository colorRepository,
            VariantRepository variantRepository
    ) {
        this.productService = productService;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.colorRepository = colorRepository;
        this.variantRepository = variantRepository;
    }

    // ============================================================
    // ADD PRODUCT
    // ============================================================

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(
            @RequestBody Product product
    ) {
        return ResponseEntity.ok(
                productService.saveProduct(product)
        );
    }

    // ============================================================
    // GET ALL PRODUCTS
    // ============================================================

    @GetMapping("/all")
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    // ============================================================
    // GET ACTIVE PRODUCTS
    // ============================================================

    @GetMapping("/active")
    public ResponseEntity<List<Product>> getActiveProducts() {

        return ResponseEntity.ok(
                productRepository.findByActiveTrue()
        );
    }

    // ============================================================
    // SEARCH
    // ============================================================

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProduct(
            @RequestParam String name
    ) {
        return ResponseEntity.ok(
                productService.searchProduct(name)
        );
    }

    // ============================================================
    // COUNT
    // ============================================================

    @GetMapping("/count")
    public ResponseEntity<Long> getProductCount() {

        return ResponseEntity.ok(
                productService.getProductCount()
        );
    }

    // ============================================================
    // USER PRODUCT CARDS
    // ============================================================

    @GetMapping("/cards")
    public ResponseEntity<List<ProductCardDTO>> getProductCards() {

        List<ProductCardDTO> products =
                productService.getActiveProductCards();

        return ResponseEntity.ok(products);
    }

    // ============================================================
    // DEACTIVATE PRODUCT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @PathVariable Long id
    ) {
        productService.deleteProduct(id);

        return ResponseEntity.ok(
                "Product deactivated successfully"
        );
    }

    // ============================================================
    // RESTORE PRODUCT
    // ============================================================

    @PutMapping("/restore/{id}")
    public ResponseEntity<String> restoreProduct(
            @PathVariable Long id
    ) {
        productService.restoreProduct(id);

        return ResponseEntity.ok(
                "Product restored successfully"
        );
    }

    // ============================================================
    // CATEGORY
    // ============================================================

    @PutMapping("/category/{id}")
    public ResponseEntity<String> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category
    ) {

        Category existing =
                categoryRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        existing.setName(category.getName());

        categoryRepository.save(existing);

        return ResponseEntity.ok(
                "Category updated successfully"
        );
    }

    // ============================================================
    // BRAND
    // ============================================================

    @PutMapping("/brand/{id}")
    public ResponseEntity<String> updateBrand(
            @PathVariable Long id,
            @RequestBody Brand brand
    ) {

        Brand existing =
                brandRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Brand not found"
                                )
                        );

        existing.setName(brand.getName());

        brandRepository.save(existing);

        return ResponseEntity.ok(
                "Brand updated successfully"
        );
    }

    // ============================================================
    // COLOR
    // ============================================================

    @PutMapping("/color/{id}")
    public ResponseEntity<String> updateColor(
            @PathVariable Long id,
            @RequestBody Color color
    ) {

        Color existing =
                colorRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Color not found"
                                )
                        );

        existing.setName(color.getName());
        existing.setHexCode(color.getHexCode());
        existing.setPrice(color.getPrice());

        colorRepository.save(existing);

        return ResponseEntity.ok(
                "Color updated successfully"
        );
    }

    // ============================================================
    // VARIANT
    // ============================================================

    @PutMapping("/variant/{id}")
    public ResponseEntity<String> updateVariant(
            @PathVariable Long id,
            @RequestBody Variant variant
    ) {

        Variant existing =
                variantRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Variant not found"
                                )
                        );

        existing.setName(variant.getName());

        existing.setAttributeValues(
                variant.getAttributeValues()
        );

        variantRepository.save(existing);

        return ResponseEntity.ok(
                "Variant updated successfully"
        );
        
    }

    // ============================================================
    // DELETE CATEGORY
    // ============================================================

    @DeleteMapping("/category/{id}")
    public ResponseEntity<String> deleteCategory(
            @PathVariable Long id
    ) {

        categoryRepository.deleteById(id);

        return ResponseEntity.ok(
                "Category deleted successfully"
        );
    }

    // ============================================================
    // DELETE BRAND
    // ============================================================

    @DeleteMapping("/brand/{id}")
    public ResponseEntity<String> deleteBrand(
            @PathVariable Long id
    ) {

        brandRepository.deleteById(id);

        return ResponseEntity.ok(
                "Brand deleted successfully"
        );
    }

    // ============================================================
    // DELETE COLOR
    // ============================================================

    @DeleteMapping("/color/{id}")
    public ResponseEntity<String> deleteColor(
            @PathVariable Long id
    ) {

        colorRepository.deleteById(id);

        return ResponseEntity.ok(
                "Color deleted successfully"
        );
    }

    // ============================================================
    // DELETE VARIANT
    // ============================================================

    @DeleteMapping("/variant/{id}")
    public ResponseEntity<String> deleteVariant(
            @PathVariable Long id
    ) {

        variantRepository.deleteById(id);

        return ResponseEntity.ok(
                "Variant deleted successfully"
        );
    }

    // ============================================================
    // GET PRODUCT BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id
    ) {

        Product product =
                productService.getProductById(id);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    // ============================================================
    // UPDATE PRODUCT
    // ============================================================

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ) {

        Product updatedProduct =
                productService.updateProduct(
                        id,
                        product
                );

        return ResponseEntity.ok(updatedProduct);
    }

    // ============================================================
    // USER PRODUCT DETAILS
    // ============================================================

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductDetailsDTO> getProductDetails(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                productService.getProductDetails(id)
        );
    }
}