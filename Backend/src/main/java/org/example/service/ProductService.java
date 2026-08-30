package org.example.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.example.dto.ProductCardDTO;
import org.example.dto.ProductDetailsDTO;
import org.example.dto.ProductSpecificationDTO;
import org.example.entity.AttributeDefinition;
import org.example.entity.Brand;
import org.example.entity.Category;
import org.example.entity.Color;
import org.example.entity.Product;
import org.example.entity.ProductAttributeValue;
import org.example.entity.Variant;
import org.example.entity.VariantAttributeValue;
import org.example.repository.AttributeDefinitionRepository;
import org.example.repository.BrandRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.InventoryRepository;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final AttributeDefinitionRepository attributeDefinitionRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(
            ProductRepository productRepository,
            InventoryRepository inventoryRepository,
            AttributeDefinitionRepository attributeDefinitionRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository
    ) {
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
        this.attributeDefinitionRepository = attributeDefinitionRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
    }

    // ============================================================
    // SAVE PRODUCT
    // ============================================================

    @Transactional
    public Product saveProduct(Product product) {

        product.setActive(true);

        // ========================================================
        // BASIC VALIDATION
        // ========================================================

        if (product.getName() == null ||
                product.getName().isBlank()) {

            throw new RuntimeException("Product name is required");
        }

        // ========================================================
        // BRAND
        // ========================================================

        if (product.getBrand() == null ||
                product.getBrand().getId() == null) {

            throw new RuntimeException("Valid brand is required");
        }

        Brand brand = brandRepository
                .findById(product.getBrand().getId())
                .orElseThrow(() ->
                        new RuntimeException("Brand not found")
                );

        // ========================================================
        // CATEGORY
        // ========================================================

        if (product.getCategory() == null ||
                product.getCategory().getId() == null) {

            throw new RuntimeException("Valid category is required");
        }

        Category category = categoryRepository
                .findById(product.getCategory().getId())
                .orElseThrow(() ->
                        new RuntimeException("Category not found")
                );

        product.setBrand(brand);
        product.setCategory(category);

        // ========================================================
        // BASE PRICE
        // ========================================================

        if (product.getBasePrice() == null ||
                product.getBasePrice().signum() < 0) {

            throw new RuntimeException(
                    "Valid base price is required"
            );
        }

        // ========================================================
        // DUPLICATE PRODUCT CHECK
        // ========================================================

        if (productRepository.existsByNameAndBrandIdAndCategoryId(
                product.getName().trim(),
                brand.getId(),
                category.getId()
        )) {

            throw new RuntimeException(
                    "Product already exists"
            );
        }

        product.setName(product.getName().trim());

        // ========================================================
        // PRODUCT SPECIFICATIONS
        // ========================================================

        updateProductSpecifications(product);

        // ========================================================
        // VARIANTS
        // ========================================================

        if (product.getVariants() != null) {

            for (Variant variant : product.getVariants()) {

                variant.setProduct(product);

                // ------------------------------------------------
                // VARIANT NAME
                // ------------------------------------------------

                if (variant.getName() == null ||
                        variant.getName().isBlank()) {

                    variant.setName(
                            buildVariantName(variant)
                    );
                }

                // ------------------------------------------------
                // VARIANT ATTRIBUTES
                // ------------------------------------------------

                updateVariantAttributes(
                        variant,
                        variant.getAttributeValues(),
                        category
                );

                // ------------------------------------------------
                // COLORS
                // ------------------------------------------------

                if (variant.getColors() != null) {

                    for (Color color : variant.getColors()) {

                        color.setVariant(variant);
                        color.setProduct(product);
                    }
                }
            }
        }

        // ========================================================
        // IMAGES
        // ========================================================

        if (product.getImages() != null) {

            product.getImages().forEach(
                    image -> image.setProduct(product)
            );
        }

        return productRepository.save(product);
    }

    // ============================================================
    // GET ALL PRODUCTS
    // ============================================================

    public List<Product> getAllProducts() {

        return productRepository.findAllByOrderByNameAsc();
    }

    // ============================================================
    // SEARCH
    // ============================================================

    public List<Product> searchProduct(String name) {

        return productRepository
                .findByNameContainingIgnoreCase(name);
    }

    // ============================================================
    // GET PRODUCT BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {

        return productRepository
                .findById(id)
                .orElse(null);
    }

    // ============================================================
    // GET PRODUCT DETAILS
    // ============================================================

    @Transactional(readOnly = true)
    public ProductDetailsDTO getProductDetails(Long id) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        List<ProductSpecificationDTO> specificationDTOs =
                new ArrayList<>();

        if (product.getAttributeValues() != null) {

            for (ProductAttributeValue pav :
                    product.getAttributeValues()) {

                AttributeDefinition attribute =
                        pav.getAttribute();

                if (attribute != null) {

                    specificationDTOs.add(
                            new ProductSpecificationDTO(
                                    attribute.getId(),
                                    attribute.getName(),
                                    attribute.getLabel(),
                                    pav.getValue(),
                                    attribute.getUnit()
                            )
                    );
                }
            }
        }

        return new ProductDetailsDTO(
                product.getId(),
                product.getName(),

                product.getBrand() != null
                        ? product.getBrand().getName()
                        : null,

                product.getCategory() != null
                        ? product.getCategory().getName()
                        : null,

                product.getDescription(),
                product.getThumbnailUrl(),
                specificationDTOs
        );
    }

    // ============================================================
    // DEACTIVATE PRODUCT
    // ============================================================

    @Transactional
    public void deleteProduct(Long id) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        product.setActive(false);

        productRepository.save(product);
    }

    // ============================================================
    // PRODUCT COUNT
    // ============================================================

    public Long getProductCount() {

        return productRepository.count();
    }

    // ============================================================
    // RESTORE PRODUCT
    // ============================================================

    @Transactional
    public void restoreProduct(Long id) {

        Product product =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        product.setActive(true);

        productRepository.save(product);
    }

    // ============================================================
    // UPDATE PRODUCT
    // ============================================================

    @Transactional
    public Product updateProduct(
            Long id,
            Product product
    ) {

        Product existing =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found"
                                )
                        );

        // ========================================================
        // BASIC VALIDATION
        // ========================================================

        if (product.getName() == null ||
                product.getName().isBlank()) {

            throw new RuntimeException(
                    "Product name is required"
            );
        }

        // ========================================================
        // BRAND
        // ========================================================

        if (product.getBrand() == null ||
                product.getBrand().getId() == null) {

            throw new RuntimeException(
                    "Valid brand is required"
            );
        }

        Brand brand =
                brandRepository
                        .findById(product.getBrand().getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Brand not found"
                                )
                        );

        // ========================================================
        // CATEGORY
        // ========================================================

        if (product.getCategory() == null ||
                product.getCategory().getId() == null) {

            throw new RuntimeException(
                    "Valid category is required"
            );
        }

        Category category =
                categoryRepository
                        .findById(product.getCategory().getId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found"
                                )
                        );

        // ========================================================
        // BASIC INFORMATION
        // ========================================================

        existing.setName(
                product.getName().trim()
        );

        existing.setBrand(brand);
        existing.setCategory(category);

        existing.setDescription(
                product.getDescription()
        );

        // ========================================================
        // BASE PRICE
        // ========================================================

        if (product.getBasePrice() == null ||
                product.getBasePrice().signum() < 0) {

            throw new RuntimeException(
                    "Valid base price is required"
            );
        }

        existing.setBasePrice(
                product.getBasePrice()
        );

        // ========================================================
        // PRODUCT SPECIFICATIONS
        // ========================================================

        updateProductSpecifications(existing, product);

        // ========================================================
        // VARIANTS
        // ========================================================

        List<Variant> existingVariants =
                existing.getVariants();

        existingVariants.clear();

        if (product.getVariants() != null) {

            for (Variant newVariant :
                    product.getVariants()) {

                newVariant.setProduct(existing);

                // ------------------------------------------------
                // VARIANT NAME
                // ------------------------------------------------

                newVariant.setName(
                        getVariantName(newVariant)
                );

                // ------------------------------------------------
                // VARIANT ATTRIBUTES
                // ------------------------------------------------

                updateVariantAttributes(
                        newVariant,
                        newVariant.getAttributeValues(),
                        category
                );

                // ------------------------------------------------
                // COLORS
                // ------------------------------------------------

                if (newVariant.getColors() != null) {

                    for (Color color :
                            newVariant.getColors()) {

                        color.setVariant(newVariant);
                        color.setProduct(existing);
                    }
                }

                existingVariants.add(newVariant);
            }
        }

        return productRepository.save(existing);
    }

    // ============================================================
    // PRODUCT SPECIFICATIONS
    // ============================================================

    /**
     * Converts:
     *
     * specifications = {
     *     "Capacity": "253L",
     *     "Energy Rating": "5 Star"
     * }
     *
     * into ProductAttributeValue records.
     */
    private void updateProductSpecifications(
            Product product
    ) {

        List<ProductAttributeValue> existingAttributes =
                product.getAttributeValues();

        existingAttributes.clear();

        if (product.getSpecifications() == null ||
                product.getSpecifications().isEmpty()) {

            return;
        }

        Category category = product.getCategory();

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        Map<String, String> specifications =
                product.getSpecifications();

        for (Map.Entry<String, String> entry :
                specifications.entrySet()) {

            String attributeName =
                    entry.getKey();

            String value =
                    entry.getValue();

            if (attributeName == null ||
                    attributeName.isBlank()) {

                continue;
            }

            // ----------------------------------------------------
            // FIND ATTRIBUTE
            // ----------------------------------------------------

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findByCategoryIdAndName(
                                    category.getId(),
                                    attributeName
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attribute '" +
                                                    attributeName +
                                                    "' does not belong to category '" +
                                                    category.getName() +
                                                    "'"
                                    )
                            );

            // ----------------------------------------------------
            // REQUIRED VALIDATION
            // ----------------------------------------------------

            if (attribute.isRequired() &&
                    (value == null ||
                            value.isBlank())) {

                throw new RuntimeException(
                        "Required attribute '" +
                                attribute.getLabel() +
                                "' is missing"
                );
            }

            // ----------------------------------------------------
            // CREATE VALUE
            // ----------------------------------------------------

            ProductAttributeValue pav =
                    new ProductAttributeValue();

            pav.setProduct(product);
            pav.setAttribute(attribute);
            pav.setValue(
                    value != null
                            ? value.trim()
                            : null
            );

            existingAttributes.add(pav);
        }
    }

    /**
     * Used during UPDATE.
     */
    private void updateProductSpecifications(
            Product existing,
            Product incoming
    ) {

        List<ProductAttributeValue> existingAttributes =
                existing.getAttributeValues();

        existingAttributes.clear();

        if (incoming.getSpecifications() == null ||
                incoming.getSpecifications().isEmpty()) {

            return;
        }

        Category category =
                existing.getCategory();

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        for (Map.Entry<String, String> entry :
                incoming.getSpecifications().entrySet()) {

            String attributeName =
                    entry.getKey();

            String value =
                    entry.getValue();

            if (attributeName == null ||
                    attributeName.isBlank()) {

                continue;
            }

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findByCategoryIdAndName(
                                    category.getId(),
                                    attributeName
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attribute '" +
                                                    attributeName +
                                                    "' does not belong to category '" +
                                                    category.getName() +
                                                    "'"
                                    )
                            );

            if (attribute.isRequired() &&
                    (value == null ||
                            value.isBlank())) {

                throw new RuntimeException(
                        "Required attribute '" +
                                attribute.getLabel() +
                                "' is missing"
                );
            }

            ProductAttributeValue pav =
                    new ProductAttributeValue();

            pav.setProduct(existing);
            pav.setAttribute(attribute);
            pav.setValue(
                    value != null
                            ? value.trim()
                            : null
            );

            existingAttributes.add(pav);
        }
    }

    // ============================================================
    // VARIANT ATTRIBUTES
    // ============================================================

    private void updateVariantAttributes(
            Variant variant,
            List<VariantAttributeValue> newAttributes,
            Category category
    ) {

        List<VariantAttributeValue> existingAttributes =
                variant.getAttributeValues();

        existingAttributes.clear();

        if (newAttributes == null ||
                newAttributes.isEmpty()) {

            return;
        }

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        for (VariantAttributeValue incoming :
                newAttributes) {

            if (incoming == null ||
                    incoming.getAttribute() == null ||
                    incoming.getAttribute().getId() == null) {

                continue;
            }

            Long attributeId =
                    incoming.getAttribute().getId();

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findById(attributeId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Variant attribute not found: "
                                                    + attributeId
                                    )
                            );

            // ----------------------------------------------------
            // CATEGORY VALIDATION
            // ----------------------------------------------------

            if (attribute.getCategory() == null ||
                    attribute.getCategory().getId() == null ||
                    !attribute.getCategory()
                            .getId()
                            .equals(category.getId())) {

                throw new RuntimeException(
                        "Variant attribute '" +
                                attribute.getName() +
                                "' does not belong to category '" +
                                category.getName() +
                                "'"
                );
            }

            VariantAttributeValue value =
                    new VariantAttributeValue();

            value.setVariant(variant);
            value.setAttribute(attribute);
            value.setValue(
                    incoming.getValue() != null
                            ? incoming.getValue().trim()
                            : null
            );

            existingAttributes.add(value);
        }
    }

    // ============================================================
    // VARIANT NAME
    // ============================================================

    private String getVariantName(
            Variant variant
    ) {

        if (variant.getName() != null &&
                !variant.getName().isBlank()) {

            return variant.getName().trim();
        }

        return buildVariantName(variant);
    }

    private String buildVariantName(
            Variant variant
    ) {

        if (variant.getAttributeValues() == null ||
                variant.getAttributeValues().isEmpty()) {

            return "Default Variant";
        }

        List<String> values =
                new ArrayList<>();

        for (VariantAttributeValue attributeValue :
                variant.getAttributeValues()) {

            if (attributeValue == null) {
                continue;
            }

            if (attributeValue.getValue() != null &&
                    !attributeValue.getValue().isBlank()) {

                values.add(
                        attributeValue.getValue().trim()
                );
            }
        }

        if (values.isEmpty()) {

            return "Default Variant";
        }

        return String.join(" / ", values);
    }

    // ============================================================
    // ACTIVE PRODUCT CARDS
    // ============================================================

    public List<ProductCardDTO> getActiveProductCards() {

        return inventoryRepository
                .findActiveProductCards();
    }
}