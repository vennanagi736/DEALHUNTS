package org.example.dto;

public class VendorCategoryDTO {

    private Long id;
    private CategoryDTO category;

    public VendorCategoryDTO() {
    }

    public VendorCategoryDTO(Long id, Long categoryId, String categoryName) {
        this.id = id;
        this.category = new CategoryDTO(categoryId, categoryName);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public CategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    public static class CategoryDTO {

        private Long id;
        private String name;

        public CategoryDTO() {
        }

        public CategoryDTO(Long id, String name) {
            this.id = id;
            this.name = name;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}