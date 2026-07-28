package org.example.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.example.entity.Color;
import org.example.entity.Product;
import org.example.entity.Variant;
import org.example.repository.ColorRepository;
import org.example.repository.ProductRepository;
import org.example.repository.VariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class AdminProductImportService {


    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private ColorRepository colorRepository;
    @Autowired
    private VariantRepository variantRepository;

    public void importProducts(MultipartFile file) {
        System.out.println("import service started");


        try {


            Reader reader = new BufferedReader(
                    new InputStreamReader(file.getInputStream())
            );


            CSVParser csvParser = CSVFormat.DEFAULT.builder()
        .setHeader()
        .setSkipHeaderRecord(true)
        .build()
        .parse(reader);



           for(CSVRecord record : csvParser){

    Product savedProduct;


    boolean exists = productRepository.existsByNameAndBrandAndCategory(
        record.get("name"),
        record.get("brand"),
        record.get("category")
    );


    if(exists){

    savedProduct = productRepository
        .findByNameAndBrandAndCategory(
            record.get("name"),
            record.get("brand"),
            record.get("category")
        );

}
else{

    Product product = new Product();

    product.setName(record.get("name"));
    product.setBrand(record.get("brand"));
    product.setCategory(record.get("category"));
    product.setDescription(record.get("description"));
    product.setProcessor(record.get("processor"));
    product.setDisplaySize(record.get("displaySize"));
    product.setBattery(record.get("battery"));

    savedProduct = productRepository.save(product);
}

    boolean variantExists = 
    variantRepository.existsByProductIdAndRamAndStorage(
        savedProduct.getId(),
        record.get("ram"),
        record.get("storage")
    );
    if(!variantExists){

    Variant variant = new Variant();

    variant.setName(
        record.get("ram")+" + "+record.get("storage")
    );

    variant.setRam(record.get("ram"));
    variant.setStorage(record.get("storage"));
    variant.setProduct(savedProduct);

    variantRepository.save(variant);

    }

    boolean colorExists = 
    colorRepository.existsByProductIdAndNameAndHexCode(
        savedProduct.getId(),
        record.get("color"),
        record.get("hexCode")
    );
    if(!colorExists){
    Color color = new Color();

    color.setName(record.get("color"));
    color.setHexCode(record.get("hexCode"));
    color.setProduct(savedProduct);

    colorRepository.save(color);
}
           }

        } catch(Exception e) {

            e.printStackTrace();

        }

    }

}