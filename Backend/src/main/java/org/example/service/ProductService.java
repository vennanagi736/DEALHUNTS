package org.example.service;

import java.util.List;

import org.example.entity.Product;
import org.example.repository.ProductRepository;
import org.springframework.stereotype.Service;


@Service
public class ProductService {

    private final ProductRepository productRepository;


    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // Save Product
public Product saveProduct(Product product) {

    // Link Variants to Product
    if (product.getVariants() != null) {

       product.getVariants().forEach(variant -> {

    variant.setProduct(product);

    if(variant.getName() == null){
        variant.setName(
            variant.getRam() + " " + variant.getStorage()
        );
    }

});

    }

    // Link Colors to Product
    if (product.getColors() != null) {

        product.getColors().forEach(color -> {
            color.setProduct(product);
        });

    }

    return productRepository.save(product);
}
    
    // Get all products alphabetically
    public List<Product> getAllProducts() {
        return productRepository.findAllByOrderByNameAsc();
    }


    // Search product
    public List<Product> searchProduct(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }


    // Get product by id
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElse(null);
    }


    // Delete product
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

}