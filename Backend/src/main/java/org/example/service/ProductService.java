package org.example.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.example.dto.ColorDTO;
import org.example.dto.ProductCardDTO;
import org.example.dto.ProductDetailsDTO;
import org.example.dto.ProductSpecificationDTO;
import org.example.dto.VariantDTO;
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
import org.example.repository.ProductAttributeValueRepository;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final AttributeDefinitionRepository attributeDefinitionRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final InventoryRepository inventoryRepository;

    public ProductService(
            ProductRepository productRepository,
            AttributeDefinitionRepository attributeDefinitionRepository,
            ProductAttributeValueRepository productAttributeValueRepository,
            BrandRepository brandRepository,
            CategoryRepository categoryRepository,
            InventoryRepository inventoryRepository
    ) {
        this.productRepository = productRepository;
        this.attributeDefinitionRepository = attributeDefinitionRepository;
        this.productAttributeValueRepository = productAttributeValueRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
        this.inventoryRepository = inventoryRepository;
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

        product.setName(
                product.getName().trim()
        );

        // ========================================================
        // PRODUCT SPECIFICATIONS
        // ========================================================

        saveProductSpecifications(product);

        // ========================================================
        // VARIANTS
        // ========================================================

        if (product.getVariants() != null) {

            Set<String> variantNames =
                    new HashSet<>();

            for (Variant variant :
                    product.getVariants()) {

                if (variant == null) {
                    continue;
                }

                variant.setProduct(product);

                // ------------------------------------------------
                // COPY INCOMING ATTRIBUTES BEFORE CLEARING
                // ------------------------------------------------

                List<VariantAttributeValue> incomingAttributes =
                        variant.getAttributeValues() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(
                                        variant.getAttributeValues()
                                );

                // ------------------------------------------------
                // SAVE VARIANT ATTRIBUTES
                // ------------------------------------------------

                updateVariantAttributes(
                        variant,
                        incomingAttributes,
                        category
                );

                // ------------------------------------------------
                // GENERATE VARIANT NAME
                // ------------------------------------------------

                String variantName =
                        buildVariantName(variant);

                variant.setName(variantName);

                // ------------------------------------------------
                // DUPLICATE VARIANT NAME CHECK
                // ------------------------------------------------

                if (!variantNames.add(variantName)) {

                    throw new RuntimeException(
                            "Duplicate variant: " +
                                    variantName
                    );
                }

                // ------------------------------------------------
                // COLORS
                // ------------------------------------------------

                if (variant.getColors() != null) {

                    for (Color color :
                            variant.getColors()) {

                        if (color == null) {
                            continue;
                        }

                        validateColor(color);

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

        return productRepository
                .findAllByOrderByNameAsc();
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

        Product product =
                productRepository
                        .findById(id)
                        .orElse(null);

        if (product == null) {
            return null;
        }

        Map<String, String> specifications =
                new LinkedHashMap<>();

        if (product.getAttributeValues() != null) {

            for (ProductAttributeValue pav :
                    product.getAttributeValues()) {

                if (pav == null ||
                        pav.getAttribute() == null) {
                    continue;
                }

                String attributeName =
                        pav.getAttribute().getName();

                String value =
                        pav.getValue();

                if (attributeName == null ||
                        attributeName.isBlank()) {
                    continue;
                }

                specifications.put(
                        attributeName.trim(),
                        value
                );
            }
        }

        product.setSpecifications(specifications);

        return product;
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

        // ========================================================
        // PRODUCT SPECIFICATIONS
        // ========================================================

        List<ProductSpecificationDTO> specificationDTOs =
                new ArrayList<>();

        if (product.getAttributeValues() != null) {

            for (ProductAttributeValue pav :
                    product.getAttributeValues()) {

                if (pav == null) {
                    continue;
                }

                AttributeDefinition attribute =
                        pav.getAttribute();

                if (attribute == null) {
                    continue;
                }

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

        // ========================================================
        // VARIANTS + COLORS
        // ========================================================

        List<VariantDTO> variantDTOs =
                new ArrayList<>();

        if (product.getVariants() != null) {

            for (Variant variant :
                    product.getVariants()) {

                if (variant == null) {
                    continue;
                }

                // ------------------------------------------------
                // COLORS FOR THIS VARIANT
                // ------------------------------------------------

                List<ColorDTO> colorDTOs =
                        new ArrayList<>();

                if (variant.getColors() != null) {

                    for (Color color :
                            variant.getColors()) {

                        if (color == null) {
                            continue;
                        }

                        colorDTOs.add(
                                new ColorDTO(
                                        color.getId(),
                                        color.getName(),
                                        color.getHexCode(),
                                        color.getPrice(),
                                        color.getDiscount()
                                )
                        );
                    }
                }

                // ------------------------------------------------
                // VARIANT ATTRIBUTE VALUES
                // ------------------------------------------------

                Map<String, String> variantAttributes =
                        new LinkedHashMap<>();

                if (variant.getAttributeValues() != null) {

                    for (VariantAttributeValue value :
                            variant.getAttributeValues()) {

                        if (value == null ||
                                value.getAttribute() == null) {
                            continue;
                        }

                        String attributeName =
                                value.getAttribute().getName();

                        if (attributeName == null ||
                                attributeName.isBlank()) {
                            continue;
                        }

                        variantAttributes.put(
                                attributeName.trim(),
                                value.getValue()
                        );
                    }
                }

                // ------------------------------------------------
                // CREATE VARIANT DTO
                // ------------------------------------------------

                VariantDTO variantDTO =
                        new VariantDTO(
                                variant.getId(),
                                variant.getName(),
                                variantAttributes,
                                colorDTOs
                        );

                // ------------------------------------------------
                // IMPORTANT: ADD DTO TO LIST
                // ------------------------------------------------

                variantDTOs.add(variantDTO);
            }
        }

        // ========================================================
        // RETURN PRODUCT DETAILS
        // ========================================================

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

                specificationDTOs,

                variantDTOs
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

        // ========================================================
        // 1. FIND EXISTING PRODUCT
        // ========================================================

        Product existing =
                productRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Product not found: " + id
                                )
                        );

        // ========================================================
        // 2. VALIDATE PRODUCT NAME
        // ========================================================

        if (product.getName() == null ||
                product.getName().isBlank()) {

            throw new RuntimeException(
                    "Product name is required"
            );
        }

        // ========================================================
        // 3. VALIDATE BRAND
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
        // 4. VALIDATE CATEGORY
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
        // 5. VALIDATE BASE PRICE
        // ========================================================

        if (product.getBasePrice() == null ||
                product.getBasePrice().signum() < 0) {

            throw new RuntimeException(
                    "Valid base price is required"
            );
        }

        // ========================================================
        // 6. UPDATE BASIC PRODUCT INFORMATION
        // ========================================================

        existing.setName(
                product.getName().trim()
        );

        existing.setBrand(brand);

        existing.setCategory(category);

        existing.setDescription(
                product.getDescription()
        );

        existing.setBasePrice(
                product.getBasePrice()
        );

        // ========================================================
        // 7. UPDATE PRODUCT SPECIFICATIONS
        // ========================================================

        updateProductSpecifications(
                existing,
                product
        );

        // ========================================================
        // 8. EXISTING VARIANTS
        // ========================================================

        List<Variant> existingVariants =
                existing.getVariants();

        if (existingVariants == null) {

            existingVariants =
                    new ArrayList<>();

            existing.setVariants(
                    existingVariants
            );
        }

        // ========================================================
        // KEEP TRACK OF FRONTEND VARIANT IDS
        // ========================================================

        List<Long> incomingVariantIds =
                new ArrayList<>();

        // ========================================================
        // CHECK DUPLICATE VARIANT NAMES
        // ========================================================

        Set<String> variantNames =
                new HashSet<>();

        // ========================================================
        // 9. PROCESS INCOMING VARIANTS
        // ========================================================

        if (product.getVariants() != null) {

            for (Variant incomingVariant :
                    product.getVariants()) {

                if (incomingVariant == null) {
                    continue;
                }

                Variant targetVariant;

                // =================================================
                // EXISTING VARIANT
                // =================================================

                if (incomingVariant.getId() != null) {

                    Long variantId =
                            incomingVariant.getId();

                    incomingVariantIds.add(
                            variantId
                    );

                    targetVariant =
                            existingVariants
                                    .stream()
                                    .filter(v ->
                                            v.getId() != null &&
                                            v.getId().equals(
                                                    variantId
                                            )
                                    )
                                    .findFirst()
                                    .orElseThrow(() ->
                                            new RuntimeException(
                                                    "Variant not found: "
                                                            + variantId
                                            )
                                    );

                }

                // =================================================
                // NEW VARIANT
                // =================================================

                else {

                    targetVariant =
                            new Variant();

                    targetVariant.setProduct(
                            existing
                    );

                    existingVariants.add(
                            targetVariant
                    );
                }

                // =================================================
                // COPY INCOMING ATTRIBUTES
                // =================================================

                List<VariantAttributeValue> incomingAttributes =
                        incomingVariant.getAttributeValues() == null
                                ? new ArrayList<>()
                                : new ArrayList<>(
                                        incomingVariant
                                                .getAttributeValues()
                                );

                // =================================================
                // UPDATE VARIANT ATTRIBUTES
                // =================================================

                /*
                 * IMPORTANT:
                 *
                 * This is called even when the incoming list
                 * is empty.
                 *
                 * Therefore old RAM/Storage values are removed
                 * if the frontend sends no attributes.
                 */

                updateVariantAttributes(
                        targetVariant,
                        incomingAttributes,
                        category
                );

                // =================================================
                // UPDATE VARIANT NAME
                // =================================================

                String incomingVariantName =
                        incomingVariant.getName();

                if (incomingVariantName != null &&
                        !incomingVariantName.isBlank()) {

                    targetVariant.setName(
                            incomingVariantName.trim()
                    );

                } else {

                    /*
                     * Build the name AFTER updating attributes.
                     *
                     * Example:
                     *
                     * RAM = 8GB
                     * Storage = 128GB
                     *
                     * Result:
                     *
                     * 8GB / 128GB
                     */

                    targetVariant.setName(
                            buildVariantName(
                                    targetVariant
                            )
                    );
                }

                // =================================================
                // DUPLICATE VARIANT NAME CHECK
                // =================================================

                String variantName =
                        targetVariant.getName();

                if (!variantNames.add(
                        variantName
                )) {

                    throw new RuntimeException(
                            "Duplicate variant: " +
                                    variantName
                    );
                }

                // =================================================
                // 10. EXISTING COLORS
                // =================================================

                List<Color> existingColors =
                        targetVariant.getColors();

                if (existingColors == null) {

                    existingColors =
                            new ArrayList<>();

                    targetVariant.setColors(
                            existingColors
                    );
                }

                // =================================================
                // KEEP TRACK OF FRONTEND COLOR IDS
                // =================================================

                List<Long> incomingColorIds =
                        new ArrayList<>();

                // =================================================
                // 11. PROCESS COLORS
                // =================================================

                if (incomingVariant.getColors() != null) {

                    for (Color incomingColor :
                            incomingVariant.getColors()) {

                        if (incomingColor == null) {
                            continue;
                        }

                        Color targetColor;

                        // =========================================
                        // EXISTING COLOR
                        // =========================================

                        if (incomingColor.getId() != null) {

                            Long colorId =
                                    incomingColor.getId();

                            incomingColorIds.add(
                                    colorId
                            );

                            targetColor =
                                    existingColors
                                            .stream()
                                            .filter(c ->
                                                    c.getId() != null &&
                                                    c.getId().equals(
                                                            colorId
                                                    )
                                            )
                                            .findFirst()
                                            .orElseThrow(() ->
                                                    new RuntimeException(
                                                            "Color not found: "
                                                                    + colorId
                                                    )
                                            );

                        }

                        // =========================================
                        // NEW COLOR
                        // =========================================

                        else {

                            targetColor =
                                    new Color();

                            targetColor.setProduct(
                                    existing
                            );

                            targetColor.setVariant(
                                    targetVariant
                            );

                            existingColors.add(
                                    targetColor
                            );
                        }

                        // =========================================
                        // UPDATE COLOR
                        // =========================================

                        targetColor.setName(
                                incomingColor.getName()
                        );

                        targetColor.setHexCode(
                                incomingColor.getHexCode()
                        );

                        targetColor.setPrice(
                                incomingColor.getPrice()
                        );

                        targetColor.setDiscount(
                                incomingColor.getDiscount()
                        );

                        targetColor.setProduct(
                                existing
                        );

                        targetColor.setVariant(
                                targetVariant
                        );

                        // =========================================
                        // VALIDATE COLOR
                        // =========================================

                        validateColor(
                                targetColor
                        );
                    }
                }

                // =================================================
                // 12. REMOVE DELETED COLORS
                // =================================================

                for (Color color : new ArrayList<>(existingColors)) {

    if (color.getId() == null) {
        continue;
    }

    if (!incomingColorIds.contains(color.getId())) {

        if (inventoryRepository.existsByColor_Id(color.getId())) {
            throw new RuntimeException(
                "Color '" + color.getName() +
                "' cannot be removed because it is used by vendor inventory."
            );
        }

        existingColors.remove(color);
    }
}
            }
        }

        // ========================================================
        // 13. REMOVE DELETED VARIANTS
        // ========================================================

        existingVariants.removeIf(
                variant ->
                        variant.getId() != null &&
                        !incomingVariantIds.contains(
                                variant.getId()
                        )
        );

        // ========================================================
        // 14. SAVE EXISTING PRODUCT
        // ========================================================

        return productRepository.save(
                existing
        );
    }

    // ============================================================
    // SAVE PRODUCT SPECIFICATIONS
    // ============================================================

    private void saveProductSpecifications(
            Product product
    ) {

        if (product.getSpecifications() == null ||
                product.getSpecifications().isEmpty()) {

            return;
        }

        Category category =
                product.getCategory();

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        for (Map.Entry<String, String> entry :
                product.getSpecifications().entrySet()) {

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
                                    attributeName.trim()
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

            pav.setProduct(product);

            pav.setAttribute(attribute);

            pav.setValue(
                    value != null
                            ? value.trim()
                            : null
            );

            product.getAttributeValues().add(
                    pav
            );
        }
    }

    // ============================================================
    // UPDATE PRODUCT SPECIFICATIONS
    // ============================================================

    private void updateProductSpecifications(
            Product existing,
            Product incoming
    ) {

        // ========================================================
        // DELETE OLD DATABASE RECORDS
        // ========================================================

        productAttributeValueRepository
                .deleteByProductId(
                        existing.getId()
                );

        // ========================================================
        // CLEAR CURRENT JPA COLLECTION
        // ========================================================

        if (existing.getAttributeValues() != null) {

            existing.getAttributeValues().clear();
        }

        // ========================================================
        // FLUSH DELETE
        // ========================================================

        productAttributeValueRepository.flush();

        // ========================================================
        // NO NEW SPECIFICATIONS
        // ========================================================

        if (incoming.getSpecifications() == null ||
                incoming.getSpecifications().isEmpty()) {

            return;
        }

        // ========================================================
        // CATEGORY
        // ========================================================

        Category category =
                existing.getCategory();

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        // ========================================================
        // INSERT NEW SPECIFICATIONS
        // ========================================================

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
                                    attributeName.trim()
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

            existing.getAttributeValues().add(
                    pav
            );
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

        if (existingAttributes == null) {

            existingAttributes =
                    new ArrayList<>();

            variant.setAttributeValues(
                    existingAttributes
            );
        }

        // ========================================================
        // CLEAR OLD VARIANT ATTRIBUTES
        // ========================================================

        existingAttributes.clear();

        // ========================================================
        // NO NEW ATTRIBUTES
        // ========================================================

        if (newAttributes == null ||
                newAttributes.isEmpty()) {

            return;
        }

        // ========================================================
        // CATEGORY VALIDATION
        // ========================================================

        if (category == null ||
                category.getId() == null) {

            throw new RuntimeException(
                    "Product category is required"
            );
        }

        // ========================================================
        // ADD NEW ATTRIBUTES
        // ========================================================

        for (VariantAttributeValue incoming :
                newAttributes) {

            if (incoming == null ||
                    incoming.getAttribute() == null ||
                    incoming.getAttribute().getId() == null) {

                continue;
            }

            Long attributeId =
                    incoming.getAttribute().getId();

            // ====================================================
            // FIND ATTRIBUTE
            // ====================================================

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findById(attributeId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Variant attribute not found: "
                                                    + attributeId
                                    )
                            );

            // ====================================================
            // VERIFY ATTRIBUTE BELONGS TO CATEGORY
            // ====================================================

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

            // ====================================================
            // CREATE NEW ATTRIBUTE VALUE
            // ====================================================

            VariantAttributeValue value =
                    new VariantAttributeValue();

            value.setVariant(variant);

            value.setAttribute(attribute);

            value.setValue(
                    incoming.getValue() != null
                            ? incoming.getValue().trim()
                            : null
            );

            existingAttributes.add(
                    value
            );
        }
    }

    // ============================================================
    // COLOR VALIDATION
    // ============================================================

    private void validateColor(Color color) {

        if (color.getName() == null ||
                color.getName().isBlank()) {

            throw new RuntimeException(
                    "Color name is required"
            );
        }

        if (color.getPrice() == null ||
                color.getPrice().signum() < 0) {

            throw new RuntimeException(
                    "Valid color price is required"
            );
        }

        if (color.getDiscount() == null) {

            color.setDiscount(
                    BigDecimal.ZERO
            );
        }

        if (color.getDiscount().signum() < 0) {

            throw new RuntimeException(
                    "Discount cannot be negative"
            );
        }

        if (color.getDiscount()
                .compareTo(color.getPrice()) > 0) {

            throw new RuntimeException(
                    "Discount cannot be greater than color price"
            );
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

        return buildVariantName(
                variant
        );
    }

    // ============================================================
    // BUILD VARIANT NAME FROM ATTRIBUTES
    // ============================================================

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
                        attributeValue
                                .getValue()
                                .trim()
                );
            }
        }

        if (values.isEmpty()) {

            return "Default Variant";
        }

        return String.join(
                " / ",
                values
        );
    }

    // ============================================================
    // ACTIVE PRODUCT CARDS
    // ============================================================

    /*
     * These are ADMIN-CREATED PRODUCTS.
     *
     * Product information comes from Product.
     *
     * Vendor inventory is NOT used here.
     *
     * There is no selling price stored here.
     */

    @Transactional(readOnly = true)
    public List<ProductCardDTO> getActiveProductCards() {

        return productRepository
                .findByActiveTrue()
                .stream()
                .map(product ->
                        new ProductCardDTO(

                                product.getId(),

                                product.getName(),

                                product.getBrand() != null
                                        ? product.getBrand().getName()
                                        : null,

                                product.getCategory() != null
                                        ? product.getCategory().getName()
                                        : null,

                                product.getThumbnailUrl(),

                                product.getBasePrice(),

                                null
                        )
                )
                .toList();
    }
}