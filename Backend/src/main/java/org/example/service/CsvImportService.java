package org.example.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
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
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CsvImportService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final AttributeDefinitionRepository attributeDefinitionRepository;

    public CsvImportService(
            ProductRepository productRepository,
            CategoryRepository categoryRepository,
            BrandRepository brandRepository,
            AttributeDefinitionRepository attributeDefinitionRepository
    ) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.attributeDefinitionRepository =
                attributeDefinitionRepository;
    }

    // ============================================================
    // IMPORT CSV
    // ============================================================

    @Transactional
    public int importProducts(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new RuntimeException("CSV file is required");
        }

        if (!file.getOriginalFilename()
                .toLowerCase()
                .endsWith(".csv")) {

            throw new RuntimeException(
                    "Only CSV files are allowed"
            );
        }

        int importedCount = 0;

        try (
                BufferedReader reader =
                        new BufferedReader(
                                new InputStreamReader(
                                        file.getInputStream(),
                                        StandardCharsets.UTF_8
                                )
                        );

                CSVParser parser =
                        CSVFormat.DEFAULT
                                .builder()
                                .setHeader()
                                .setSkipHeaderRecord(true)
                                .setIgnoreEmptyLines(true)
                                .setTrim(true)
                                .build()
                                .parse(reader)
        ) {

            for (CSVRecord record : parser) {

                if (record.size() == 0) {
                    continue;
                }

                importProduct(record, parser.getHeaderMap());

                importedCount++;
            }

        } catch (Exception e) {

            throw new RuntimeException(
                    "CSV import failed: " + e.getMessage(),
                    e
            );
        }

        return importedCount;
    }

    // ============================================================
    // IMPORT ONE PRODUCT
    // ============================================================

    private void importProduct(
            CSVRecord record,
            Map<String, Integer> headers
    ) {

        // ========================================================
        // REQUIRED BASIC FIELDS
        // ========================================================

        String categoryName =
                getValue(record, headers, "category");

        String brandName =
                getValue(record, headers, "brand");

        String productName =
                getValue(record, headers, "product_name");

        String description =
                getValue(record, headers, "description");

        String basePriceValue =
                getValue(record, headers, "base_price");

        if (isBlank(categoryName)) {
            throw new RuntimeException(
                    "Category is required at CSV row "
                            + record.getRecordNumber()
            );
        }

        if (isBlank(brandName)) {
            throw new RuntimeException(
                    "Brand is required at CSV row "
                            + record.getRecordNumber()
            );
        }

        if (isBlank(productName)) {
            throw new RuntimeException(
                    "Product name is required at CSV row "
                            + record.getRecordNumber()
            );
        }

        if (isBlank(basePriceValue)) {
            throw new RuntimeException(
                    "Base price is required for product "
                            + productName
            );
        }

        // ========================================================
        // CATEGORY
        // ========================================================

        Category category =
                categoryRepository
                        .findByNameIgnoreCase(
                                categoryName.trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Category not found: "
                                                + categoryName
                                )
                        );

        // ========================================================
        // BRAND
        // ========================================================

        Brand brand =
                brandRepository
                        .findByNameIgnoreCase(
                                brandName.trim()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Brand not found: "
                                                + brandName
                                )
                        );

        // ========================================================
        // DUPLICATE PRODUCT
        // ========================================================

        if (productRepository
                .existsByNameAndBrandIdAndCategoryId(
                        productName.trim(),
                        brand.getId(),
                        category.getId()
                )) {

            throw new RuntimeException(
                    "Product already exists: "
                            + productName
            );
        }

        // ========================================================
        // PRODUCT
        // ========================================================

        Product product = new Product();

        product.setName(productName.trim());
        product.setDescription(description);
        product.setBrand(brand);
        product.setCategory(category);
        product.setActive(true);

        try {

            product.setBasePrice(
                    new BigDecimal(
                            basePriceValue.trim()
                    )
            );

        } catch (NumberFormatException e) {

            throw new RuntimeException(
                    "Invalid base price for product: "
                            + productName
            );
        }

        // ========================================================
        // DYNAMIC PRODUCT SPECIFICATIONS
        // ========================================================

        importProductSpecifications(
                product,
                category,
                record,
                headers
        );

        // ========================================================
        // VARIANT
        // ========================================================

        importVariant(
                product,
                category,
                record,
                headers
        );

        // ========================================================
        // SAVE
        // ========================================================

        productRepository.save(product);
    }

    // ============================================================
    // PRODUCT SPECIFICATIONS
    // ============================================================

    private void importProductSpecifications(
            Product product,
            Category category,
            CSVRecord record,
            Map<String, Integer> headers
    ) {

        Map<String, String> specifications =
                new HashMap<>();

        Set<String> ignoredColumns =
                getIgnoredColumns();

        for (String header : headers.keySet()) {

            if (header == null) {
                continue;
            }

            String cleanHeader =
                    header.trim();

            if (ignoredColumns.contains(
                    cleanHeader.toLowerCase()
            )) {
                continue;
            }

            String value =
                    getValue(
                            record,
                            headers,
                            cleanHeader
                    );

            if (isBlank(value)) {
                continue;
            }

            // ----------------------------------------------------
            // Find dynamic attribute
            // ----------------------------------------------------

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findByCategoryIdAndNameIgnoreCase(
                                    category.getId(),
                                    cleanHeader
                            )
                            .orElse(null);

            if (attribute == null) {

                throw new RuntimeException(
                        "Attribute '" +
                                cleanHeader +
                                "' does not belong to category '" +
                                category.getName() +
                                "' at CSV row " +
                                record.getRecordNumber()
                );
            }

            specifications.put(
                    attribute.getName(),
                    value.trim()
            );
        }

        product.setSpecifications(
                specifications
        );

        // Create ProductAttributeValue records
        for (Map.Entry<String, String> entry :
                specifications.entrySet()) {

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findByCategoryIdAndNameIgnoreCase(
                                    category.getId(),
                                    entry.getKey()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Attribute not found: "
                                                    + entry.getKey()
                                    )
                            );

            ProductAttributeValue value =
                    new ProductAttributeValue();

            value.setProduct(product);
            value.setAttribute(attribute);
            value.setValue(entry.getValue());

            product.getAttributeValues()
                    .add(value);
        }
    }

    // ============================================================
    // VARIANT
    // ============================================================

    private void importVariant(
            Product product,
            Category category,
            CSVRecord record,
            Map<String, Integer> headers
    ) {

        String variantName =
                getValue(
                        record,
                        headers,
                        "variant_name"
                );

        String colorName =
                getValue(
                        record,
                        headers,
                        "color"
                );

        String colorHex =
                getValue(
                        record,
                        headers,
                        "color_hex"
                );

        // --------------------------------------------------------
        // If no variant/color information, don't create variant
        // --------------------------------------------------------

        if (isBlank(variantName)
                && isBlank(colorName)) {

            return;
        }

        Variant variant =
                new Variant();

        variant.setProduct(product);

        if (!isBlank(variantName)) {

            variant.setName(
                    variantName.trim()
            );

        } else {

            variant.setName(
                    "Default Variant"
            );
        }

        // ========================================================
        // VARIANT ATTRIBUTES
        // ========================================================

        importVariantAttributes(
                variant,
                category,
                record,
                headers
        );

        // ========================================================
        // COLOR
        // ========================================================

        if (!isBlank(colorName)) {

            Color color =
                    new Color();

            color.setName(
                    colorName.trim()
            );

            color.setHexCode(
                    isBlank(colorHex)
                            ? null
                            : colorHex.trim()
            );

            color.setProduct(product);
            color.setVariant(variant);

            variant.getColors()
                    .add(color);
        }

        product.getVariants()
                .add(variant);
    }

    // ============================================================
    // VARIANT ATTRIBUTES
    // ============================================================

    private void importVariantAttributes(
            Variant variant,
            Category category,
            CSVRecord record,
            Map<String, Integer> headers
    ) {

        Set<String> ignoredColumns =
                getIgnoredColumns();

        for (String header : headers.keySet()) {

            if (header == null) {
                continue;
            }

            String cleanHeader =
                    header.trim();

            // These belong to product/color/etc.
            if (ignoredColumns.contains(
                    cleanHeader.toLowerCase()
            )) {
                continue;
            }

            String value =
                    getValue(
                            record,
                            headers,
                            cleanHeader
                    );

            if (isBlank(value)) {
                continue;
            }

            AttributeDefinition attribute =
                    attributeDefinitionRepository
                            .findByCategoryIdAndNameIgnoreCase(
                                    category.getId(),
                                    cleanHeader
                            )
                            .orElse(null);

            if (attribute == null) {
                continue;
            }

            VariantAttributeValue variantValue =
                    new VariantAttributeValue();

            variantValue.setVariant(
                    variant
            );

            variantValue.setAttribute(
                    attribute
            );

            variantValue.setValue(
                    value.trim()
            );

            variant.getAttributeValues()
                    .add(variantValue);
        }
    }

    // ============================================================
    // IGNORED CSV COLUMNS
    // ============================================================

    private Set<String> getIgnoredColumns() {

        Set<String> columns =
                new HashSet<>();

        columns.add("category");
        columns.add("brand");
        columns.add("product_name");
        columns.add("description");
        columns.add("base_price");

        columns.add("variant_name");

        columns.add("color");
        columns.add("color_hex");
        columns.add("color_price");

        columns.add("vendor_id");

        columns.add("condition");
        columns.add("stock");
        columns.add("discount");
        columns.add("warranty");
        columns.add("delivery_time");

        columns.add("home_delivery");
        columns.add("store_pickup");
        columns.add("cod");
        columns.add("emi");
        columns.add("exchange");

        columns.add("offer_title");
        columns.add("offer_description");

        columns.add("return_policy");
        columns.add("min_purchase");
        columns.add("max_purchase");

        return columns;
    }

    // ============================================================
    // CSV VALUE
    // ============================================================

    private String getValue(
            CSVRecord record,
            Map<String, Integer> headers,
            String column
    ) {

        Integer index =
                headers.get(column);

        if (index == null) {

            // Try case-insensitive lookup
            for (Map.Entry<String, Integer> entry :
                    headers.entrySet()) {

                if (entry.getKey()
                        .equalsIgnoreCase(column)) {

                    index = entry.getValue();
                    break;
                }
            }
        }

        if (index == null ||
                index >= record.size()) {

            return null;
        }

        String value =
                record.get(index);

        return value == null
                ? null
                : value.trim();
    }

    // ============================================================
    // BLANK CHECK
    // ============================================================

    private boolean isBlank(String value) {

        return value == null ||
                value.trim().isEmpty();
    }
}