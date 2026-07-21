package org.example.controller;

import java.util.List;

import org.example.entity.Product;
import org.example.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/admin/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {


    @Autowired
    private ProductService productService;


    // Add product from admin
    @PostMapping("/add")
    public Product addProduct(
            @RequestBody Product product) {

        return productService.saveProduct(product);
    }


    // Get all products alphabetically
    @GetMapping("/all")
    public List<Product> getAllProducts(){

        return productService.getAllProducts();

    }


    // Search product
    @GetMapping("/search")
    public List<Product> searchProduct(
            @RequestParam String name){

        return productService.searchProduct(name);

    }


    // Delete product
    @DeleteMapping("/{id}")
    public void deleteProduct(
            @PathVariable Long id){

        productService.deleteProduct(id);

    }
    @GetMapping("/{id}")
public Product getProductById(@PathVariable Long id) {
    return productService.getProductById(id);
}

}