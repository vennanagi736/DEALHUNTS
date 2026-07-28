package org.example.entity;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "product")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String brand;
    private String category;
    private String description;

    
    @JsonManagedReference
    @OneToMany(
        mappedBy="product",
        cascade=CascadeType.ALL,
        orphanRemoval=true
    )
    private List<Image> images = new ArrayList<>();


    @JsonManagedReference
    @OneToMany(
        mappedBy="product",
        cascade=CascadeType.ALL,
        orphanRemoval=true
    )
    private List<Variant> variants = new ArrayList<>();


    private String processor;
    private String displaySize;
    private String battery;


    @JsonManagedReference
    @OneToMany(
        mappedBy="product",
        cascade=CascadeType.ALL
    )
    private List<Color> colors = new ArrayList<>();

    @JsonManagedReference
    @OneToMany(
        mappedBy="product",
        cascade=CascadeType.ALL,
        orphanRemoval=true
    )
    private List<Inventory> inventories = new ArrayList<>();


    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id = id;
    }


    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }


    public String getBrand(){
        return brand;
    }

    public void setBrand(String brand){
        this.brand = brand;
    }


    public String getCategory(){
        return category;
    }

    public void setCategory(String category){
        this.category = category;
    }


    public String getDescription(){
        return description;
    }

    public void setDescription(String description){
        this.description = description;
    }


    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }


    public List<Variant> getVariants() {
        return variants;
    }

    public void setVariants(List<Variant> variants) {
        this.variants = variants;
    }


    public String getProcessor(){
        return processor;
    }

    public void setProcessor(String processor){
        this.processor = processor;
    }


    public String getDisplaySize(){
        return displaySize;
    }

    public void setDisplaySize(String displaySize){
        this.displaySize = displaySize;
    }


    public String getBattery(){
        return battery;
    }

    public void setBattery(String battery){
        this.battery = battery;
    }


    public List<Color> getColors() {
        return colors;
    }

    public void setColors(List<Color> colors) {
        this.colors = colors;
    }


    public List<Inventory> getInventories() {
        return inventories;
    }

    public void setInventories(List<Inventory> inventories) {
        this.inventories = inventories;
    }
}