package org.example.controller;

import java.util.List;

import org.example.entity.Brand;
import org.example.entity.Category;
import org.example.entity.Color;
import org.example.entity.Variant;
import org.example.service.MasterDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class MasterDataController {

    private final MasterDataService masterDataService;

    @Autowired
    public MasterDataController(MasterDataService masterDataService) {
        this.masterDataService = masterDataService;
    }

    @PostMapping("/categories/add")
    public Category addCategory(@RequestBody Category category) {
        return masterDataService.addCategory(category);
    }

    @GetMapping("/categories/all")
    public List<Category> getAllCategories() {
        return masterDataService.getAllCategories();
    }
     @PostMapping("/brands/add")
    public Brand addBrand(@RequestBody Brand brand) {
        return masterDataService.addBrand(brand);
    }

    @GetMapping("/brands/all")
    public List<Brand> getAllBrands() {
        return masterDataService.getAllBrand();
    }
     @PostMapping("/colors/add")
    public Color addColor(@RequestBody Color color) {
        System.out.println("Name:"+color.getName());
        System.out.println("Hex code:"+color.getHexCode());

        return masterDataService.addColor(color);
    }

    @GetMapping("/colors/all")
    public List<Color> getAllColors() {
        return masterDataService.getAllColor();
    }
     @PostMapping("/variants/add")
    public Variant addVariant(@RequestBody Variant variant) {

         System.out.println("Name     : " + variant.getName());
    System.out.println("RAM      : " + variant.getRam());
    System.out.println("Storage  : " + variant.getStorage());
        return masterDataService.addVariant(variant);
    }

    @GetMapping("/variants/all")
    public List<Variant> getAllVariants() {
        return masterDataService.getAllVariant();
    }

}