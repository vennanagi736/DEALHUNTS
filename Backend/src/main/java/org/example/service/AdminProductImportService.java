package org.example.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.Reader;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.example.entity.Product;
import org.example.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class AdminProductImportService {


    @Autowired
    private ProductRepository productRepository;


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



            for(CSVRecord record : csvParser) {


                Product product = new Product();


                product.setCategory(
                    record.get("category")
                );

                product.setBrand(
                    record.get("brand")
                );

                product.setName(
                    record.get("name")
                );

                product.setDescription(
                    record.get("description")
                );

                product.setVariant(
                    record.get("variant")
                );

                product.setProcessor(
                    record.get("processor")
                );

                product.setDisplaySize(
                    record.get("displaySize")
                );

                product.setBattery(
                    record.get("battery")
                );

                product.setColor(
                    record.get("color")
                );

                product.setHexCode(
                    record.get("hexCode")
                );

   System.out.println("Saving: " +product.getName());

                productRepository.save(product);

            }


        } catch(Exception e) {

            e.printStackTrace();

        }

    }

}