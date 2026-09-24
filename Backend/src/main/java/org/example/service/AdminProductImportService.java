package org.example.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.example.entity.AttributeDefinition;
import org.example.entity.Brand;
import org.example.entity.Category;
import org.example.entity.Color;
import org.example.entity.Product;
import org.example.entity.Variant;
import org.example.entity.VariantAttributeValue;
import org.example.repository.AttributeDefinitionRepository;
import org.example.repository.BrandRepository;
import org.example.repository.CategoryRepository;
import org.example.repository.ColorRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class AdminProductImportService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ColorRepository colorRepository;

    @Autowired
    private VariantRepository variantRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AttributeDefinitionRepository attributeDefinitionRepository;


    // ============================================================
    // IMPORT PRODUCTS
    // ============================================================

    public void importProducts(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        try (
            Reader reader = new BufferedReader(
                new InputStreamReader(
                    file.getInputStream(),
                    StandardCharsets.UTF_8
                )
            );

            CSVParser csvParser = CSVFormat.DEFAULT.builder()
                .setHeader()
                .setSkipHeaderRecord(true)
                .setIgnoreHeaderCase(true)
                .setTrim(true)
                .build()
                .parse(reader)
        ) {

            // =====================================================
            // CHECK REQUIRED CSV HEADERS
            // =====================================================

            if (!csvParser.getHeaderMap().containsKey("name")) {
                throw new IllegalArgumentException(
                    "CSV must contain a 'name' column"
                );
            }

            if (!csvParser.getHeaderMap().containsKey("brand")) {
                throw new IllegalArgumentException(
                    "CSV must contain a 'brand' column"
                );
            }

            if (!csvParser.getHeaderMap().containsKey("category")) {
                throw new IllegalArgumentException(
                    "CSV must contain a 'category' column"
                );
            }

            if (!csvParser.getHeaderMap().containsKey("basePrice")) {
                throw new IllegalArgumentException(
                    "CSV must contain a 'basePrice' column"
                );
            }


            // =====================================================
            // PROCESS EACH CSV ROW
            // =====================================================

            for (CSVRecord record : csvParser) {

                // =================================================
                // BASIC PRODUCT DATA
                // =================================================

                String name =
                    getColumnValue(record, "name");

                String brandName =
                    getColumnValue(record, "brand");

                String categoryName =
                    getColumnValue(record, "category");

                String description =
                    getColumnValue(record, "description");

                String basePriceValue =
                    getColumnValue(record, "basePrice");


                // =================================================
                // VALIDATION
                // =================================================

                if (name == null || name.isBlank()) {
                    throw new IllegalArgumentException(
                        "Product name is required at CSV row "
                        + record.getRecordNumber()
                    );
                }

                if (brandName == null || brandName.isBlank()) {
                    throw new IllegalArgumentException(
                        "Brand is required for product: "
                        + name
                    );
                }

                if (categoryName == null || categoryName.isBlank()) {
                    throw new IllegalArgumentException(
                        "Category is required for product: "
                        + name
                    );
                }

                if (
                    basePriceValue == null ||
                    basePriceValue.isBlank()
                ) {
                    throw new IllegalArgumentException(
                        "Base price is required for product: "
                        + name
                    );
                }


                // =================================================
                // FIND BRAND
                // =================================================

                Brand brand =
                    brandRepository
                        .findByNameIgnoreCase(brandName)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "Brand not found: "
                                + brandName
                                + " for product: "
                                + name
                            )
                        );


                // =================================================
                // FIND CATEGORY
                // =================================================

                Category category =
                    categoryRepository
                        .findByNameIgnoreCase(categoryName)
                        .orElseThrow(() ->
                            new IllegalArgumentException(
                                "Category not found: "
                                + categoryName
                                + " for product: "
                                + name
                            )
                        );


                // =================================================
                // BASE PRICE
                // =================================================

                BigDecimal basePrice =
                    parseBasePrice(
                        basePriceValue,
                        name
                    );


                // =================================================
                // FIND OR CREATE PRODUCT
                // =================================================

                Product savedProduct = null;

                List<Product> existingProducts =
                    productRepository
                        .findByNameContainingIgnoreCase(name);

                for (Product existingProduct :
                        existingProducts) {

                    if (
                        existingProduct.getName() != null &&
                        existingProduct.getName()
                            .equalsIgnoreCase(name) &&

                        existingProduct.getBrand() != null &&
                        existingProduct.getBrand()
                            .getId()
                            .equals(brand.getId()) &&

                        existingProduct.getCategory() != null &&
                        existingProduct.getCategory()
                            .getId()
                            .equals(category.getId())
                    ) {

                        savedProduct = existingProduct;
                        break;
                    }
                }


                // =================================================
                // EXISTING PRODUCT
                // =================================================

                if (savedProduct != null) {

                    savedProduct.setBasePrice(basePrice);

                    if (
                        description != null &&
                        !description.isBlank()
                    ) {

                        savedProduct.setDescription(
                            description.trim()
                        );
                    }

                    savedProduct =
                        productRepository.save(savedProduct);
                }


                // =================================================
                // NEW PRODUCT
                // =================================================

                else {

                    Product product = new Product();

                    product.setName(name.trim());

                    product.setBrand(brand);

                    product.setCategory(category);

                    product.setDescription(
                        description != null &&
                        !description.isBlank()
                            ? description.trim()
                            : null
                    );

                    product.setBasePrice(basePrice);

                    product.setActive(true);

                    savedProduct =
                        productRepository.save(product);
                }


                // =================================================
                // VARIANT DATA
                // =================================================

                String ram =
                    getColumnValue(record, "ram");

                String storage =
                    getColumnValue(record, "storage");


                // =================================================
                // FIND OR CREATE VARIANT
                // =================================================

                Variant variant = null;

                boolean hasVariantData =
                    (ram != null && !ram.isBlank()) ||
                    (storage != null && !storage.isBlank());


                if (hasVariantData) {

                    String variantName =
                        buildVariantName(
                            ram,
                            storage
                        );


                    // =================================================
                    // FIND EXISTING VARIANT
                    // =================================================

                    Optional<Variant> existingVariant =
                        variantRepository
                            .findByProductIdAndNameIgnoreCase(
                                savedProduct.getId(),
                                variantName
                            );


                    if (existingVariant.isPresent()) {

                        // ---------------------------------------------
                        // REUSE EXISTING VARIANT
                        // ---------------------------------------------

                        variant = existingVariant.get();

                        System.out.println(
                            "Reusing existing variant: "
                            + variantName
                            + " for product: "
                            + savedProduct.getName()
                        );

                    } else {

                        // ---------------------------------------------
                        // CREATE NEW VARIANT
                        // ---------------------------------------------

                        variant = new Variant();

                        variant.setName(
                            variantName
                        );

                        variant.setProduct(
                            savedProduct
                        );


                        // =============================================
                        // ATTRIBUTE VALUES
                        // =============================================

                        List<VariantAttributeValue>
                            attributeValues =
                                new ArrayList<>();


                        // =============================================
                        // RAM
                        // =============================================

                        if (
                            ram != null &&
                            !ram.isBlank()
                        ) {

                            AttributeDefinition ramAttribute =
                                attributeDefinitionRepository
                                    .findByCategoryIdAndNameIgnoreCase(
                                        category.getId(),
                                        "ram"
                                    )
                                    .orElse(null);


                            if (ramAttribute != null) {

                                VariantAttributeValue ramValue =
                                    new VariantAttributeValue();

                                ramValue.setAttribute(
                                    ramAttribute
                                );

                                ramValue.setValue(
                                    ram.trim()
                                );

                                attributeValues.add(
                                    ramValue
                                );
                            }
                        }


                        // =============================================
                        // STORAGE
                        // =============================================

                        if (
                            storage != null &&
                            !storage.isBlank()
                        ) {

                            AttributeDefinition storageAttribute =
                                attributeDefinitionRepository
                                    .findByCategoryIdAndNameIgnoreCase(
                                        category.getId(),
                                        "storage"
                                    )
                                    .orElse(null);


                            if (storageAttribute != null) {

                                VariantAttributeValue storageValue =
                                    new VariantAttributeValue();

                                storageValue.setAttribute(
                                    storageAttribute
                                );

                                storageValue.setValue(
                                    storage.trim()
                                );

                                attributeValues.add(
                                    storageValue
                                );
                            }
                        }


                        // =================================================
                        // SET ATTRIBUTE VALUES
                        // =================================================

                        variant.setAttributeValues(
                            attributeValues
                        );


                        // =================================================
                        // SAVE VARIANT
                        // =================================================

                        variant =
                            variantRepository.save(variant);


                        System.out.println(
                            "Created new variant: "
                            + variantName
                            + " for product: "
                            + savedProduct.getName()
                        );
                    }
                }


                // =================================================
                // COLOR DATA
                // =================================================

                String colorName =
                    getColumnValue(record, "color");

                String hexCode =
                    getColumnValue(record, "hexCode");


                // =================================================
                // CREATE COLOR
                // =================================================

                if (
                    colorName != null &&
                    !colorName.isBlank()
                ) {

                    String cleanColorName =
                        colorName.trim();

                    String cleanHexCode =
                        hexCode != null &&
                        !hexCode.isBlank()
                            ? hexCode.trim()
                            : null;


                    // =================================================
                    // COLOR MUST BELONG TO A VARIANT
                    // =================================================

                    if (variant == null) {

                        throw new IllegalArgumentException(
                            "Color '"
                            + cleanColorName
                            + "' requires a variant for product: "
                            + name
                        );
                    }


                    // =================================================
                    // CHECK DUPLICATE COLOR
                    // =================================================

                    boolean colorExists =
                        colorRepository
                            .existsByVariantIdAndNameAndHexCode(
                                variant.getId(),
                                cleanColorName,
                                cleanHexCode
                            );


                    // =================================================
                    // CREATE COLOR
                    // =================================================

                    if (!colorExists) {

                        Color color =
                            new Color();

                        color.setName(
                            cleanColorName
                        );

                        color.setHexCode(
                            cleanHexCode
                        );

                        // Product relationship
                        color.setProduct(
                            savedProduct
                        );

                        // IMPORTANT:
                        // Color belongs to this specific variant
                        color.setVariant(
                            variant
                        );

                        colorRepository.save(color);


                        System.out.println(
                            "Created color: "
                            + cleanColorName
                            + " for variant: "
                            + variant.getName()
                        );
                    } else {

                        System.out.println(
                            "Color already exists: "
                            + cleanColorName
                            + " for variant: "
                            + variant.getName()
                        );
                    }
                }


                // =================================================
                // LOG
                // =================================================

                System.out.println(
                    "Imported product successfully: "
                    + name
                );
            }

        } catch (Exception e) {

            e.printStackTrace();

            throw new RuntimeException(
                "Failed to import products: "
                + e.getMessage(),
                e
            );
        }
    }


    // ============================================================
    // BUILD VARIANT NAME
    // ============================================================

    private String buildVariantName(
        String ram,
        String storage
    ) {

        StringBuilder name =
            new StringBuilder();


        if (
            ram != null &&
            !ram.isBlank()
        ) {

            name.append(
                ram.trim()
            );
        }


        if (
            storage != null &&
            !storage.isBlank()
        ) {

            if (name.length() > 0) {
                name.append(" + ");
            }

            name.append(
                storage.trim()
            );
        }


        return name.toString();
    }


    // ============================================================
    // PARSE BASE PRICE
    // ============================================================

    private BigDecimal parseBasePrice(
        String value,
        String productName
    ) {

        try {

            BigDecimal price =
                new BigDecimal(
                    value.trim()
                );


            if (
                price.compareTo(
                    BigDecimal.ZERO
                ) <= 0
            ) {

                throw new IllegalArgumentException(
                    "Base price must be greater than zero "
                    + "for product: "
                    + productName
                );
            }


            return price;

        } catch (NumberFormatException e) {

            throw new IllegalArgumentException(
                "Invalid basePrice '"
                + value
                + "' for product: "
                + productName
            );
        }
    }


    // ============================================================
    // GET CSV COLUMN VALUE
    // ============================================================

    private String getColumnValue(
        CSVRecord record,
        String column
    ) {

        try {

            String actualColumn = null;


            // =====================================================
            // HANDLE UTF-8 BOM
            // =====================================================

            for (
                String header :
                record.getParser()
                    .getHeaderNames()
            ) {

                if (
                    header != null &&
                    header.trim()
                        .replace("\uFEFF", "")
                        .equalsIgnoreCase(column)
                ) {

                    actualColumn = header;
                    break;
                }
            }


            if (actualColumn == null) {
                return null;
            }


            String value =
                record.get(actualColumn);


            if (value == null) {
                return null;
            }


            return value
                .replace("\uFEFF", "")
                .trim();

        } catch (Exception e) {

            return null;
        }
    }
}