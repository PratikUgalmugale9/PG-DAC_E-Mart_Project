package com.example.service;

import com.example.entity.Product;
import com.example.repository.ProductRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Service
public class ExcelService {

    private final ProductRepository productRepository;

    public ExcelService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> uploadProducts(MultipartFile file) throws Exception {
        List<Product> products = new ArrayList<>();

        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header if exists
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();

                // Skip empty rows
                if (currentRow.getCell(0) == null)
                    continue;

                Product product = new Product();

                // Column 0: Category ID
                product.setCategoryId((int) getNumericValue(currentRow.getCell(0)));
                // Column 1: Product Name
                product.setProdName(getStringValue(currentRow.getCell(1)));
                // Column 2: Short Description
                product.setProdShortDesc(getStringValue(currentRow.getCell(2)));
                // Column 3: Long Description
                product.setProdLongDesc(getStringValue(currentRow.getCell(3)));
                // Column 4: MRP Price
                product.setMrpPrice(BigDecimal.valueOf(getNumericValue(currentRow.getCell(4))));
                // Column 5: Cardholder Price
                product.setCardholderPrice(BigDecimal.valueOf(getNumericValue(currentRow.getCell(5))));
                // Column 6: Points to Redeem
                product.setPointsToBeRedeem((int) getNumericValue(currentRow.getCell(6)));
                // Column 7: Image Path
                product.setProdImagePath(getStringValue(currentRow.getCell(7)));

                products.add(product);
            }

            productRepository.saveAll(products);
        }
        return products;
    }

    private String getStringValue(Cell cell) {
        if (cell == null)
            return "";
        if (cell.getCellType() == CellType.STRING)
            return cell.getStringCellValue();
        if (cell.getCellType() == CellType.NUMERIC)
            return String.valueOf(cell.getNumericCellValue());
        return "";
    }

    private double getNumericValue(Cell cell) {
        if (cell == null)
            return 0.0;
        if (cell.getCellType() == CellType.NUMERIC)
            return cell.getNumericCellValue();
        if (cell.getCellType() == CellType.STRING) {
            try {
                return Double.parseDouble(cell.getStringCellValue());
            } catch (Exception e) {
                return 0.0;
            }
        }
        return 0.0;
    }
}
