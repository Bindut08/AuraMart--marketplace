export interface SchemaTable {
  name: string;
  description: string;
  columns: { name: string; type: string; constraints?: string; description: string }[];
}

export const oracleSchema: SchemaTable[] = [
  {
    name: "USERS",
    description: "Core credentials and identity profile. Holds credentials and security roles (ADMIN, VENDOR, CUSTOMER).",
    columns: [
      { name: "USER_ID", type: "NUMBER", constraints: "GENERATED AS IDENTITY (PK)", description: "Unique auto-incrementing surrogate primary key." },
      { name: "EMAIL", type: "VARCHAR2(100)", constraints: "NOT NULL UNIQUE", description: "Login identifier and communications email." },
      { name: "PASSWORD_HASH", type: "VARCHAR2(255)", constraints: "NOT NULL", description: "Bcrypt hash representing the salted stateless security credential." },
      { name: "FULL_NAME", type: "VARCHAR2(150)", constraints: "NOT NULL", description: "Legal name of customer, vendor representative, or administrator." },
      { name: "ROLE", type: "VARCHAR2(30)", constraints: "NOT NULL (CHECK: ADMIN/VENDOR/CUSTOMER)", description: "Role matching role-based access control (e.g. ROLE_CUSTOMER, ROLE_VENDOR, ROLE_ADMIN)." },
      { name: "CREATED_AT", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP NOT NULL", description: "Audit column recording user initialization." }
    ]
  },
  {
    name: "VENDORS",
    description: "Vendor store profile mapped 1:1 with users who hold the ROLE_VENDOR role.",
    columns: [
      { name: "VENDOR_ID", type: "NUMBER", constraints: "PRIMARY KEY (FK references USERS.USER_ID)", description: "Primary Key linked directly to the parent Identity record for 1-to-1 profile extension." },
      { name: "COMPANY_NAME", type: "VARCHAR2(150)", constraints: "NOT NULL UNIQUE", description: "Registered public brand name of the merchant store." },
      { name: "STORE_DESCRIPTION", type: "VARCHAR2(1000)", constraints: "NULLABLE", description: "Detailed narrative describing storefront specializations." },
      { name: "IS_APPROVED", type: "NUMBER(1)", constraints: "DEFAULT 0 NOT NULL (CHECK: 0, 1)", description: "Boolean flag representing admin platform-approval status (1=Approved, 0=Pending/Banned)." },
      { name: "CREATED_AT", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP NOT NULL", description: "Audit trail timestamp." }
    ]
  },
  {
    name: "PRODUCTS",
    description: "Individual products owned by authorized vendors, mapped many-to-one to VENDORS.",
    columns: [
      { name: "PRODUCT_ID", type: "NUMBER", constraints: "GENERATED AS IDENTITY (PK)", description: "Primary auto-incrementing key." },
      { name: "VENDOR_ID", type: "NUMBER", constraints: "NOT NULL (FK references VENDORS.VENDOR_ID)", description: "Direct ownership pointer. Allows strict access limits so vendors edit only their inventory." },
      { name: "NAME", type: "VARCHAR2(150)", constraints: "NOT NULL", description: "Public descriptive catalog title." },
      { name: "DESCRIPTION", type: "VARCHAR2(1000)", constraints: "NULLABLE", description: "Extended technical or visual description." },
      { name: "PRICE", type: "NUMBER(10,2)", constraints: "NOT NULL (CHECK: > 0)", description: "Selling price with 2-digit decimal scale." },
      { name: "STOCK_LEVEL", type: "NUMBER(8)", constraints: "NOT NULL (CHECK: >= 0)", description: "Current inventory volume in warehouse." },
      { name: "VERSION", type: "NUMBER(10)", constraints: "DEFAULT 0 NOT NULL", description: "Optimistic locking attribute used by Hibernate/Spring Data to prevent race conditions." },
      { name: "CREATED_AT", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP NOT NULL", description: "Audit record timestamp." }
    ]
  },
  {
    name: "ORDERS",
    description: "Global purchase transaction containing multi-vendor checkout aggregates.",
    columns: [
      { name: "ORDER_ID", type: "NUMBER", constraints: "GENERATED AS IDENTITY (PK)", description: "Globally unique platform invoice reference." },
      { name: "CUSTOMER_ID", type: "NUMBER", constraints: "NOT NULL (FK references USERS.USER_ID)", description: "Reference to checkout customer identity." },
      { name: "TOTAL_AMOUNT", type: "NUMBER(12,2)", constraints: "NOT NULL", description: "Sum aggregate of all purchase prices and quantities across vendors." },
      { name: "SHIPPING_ADDRESS", type: "VARCHAR2(500)", constraints: "NOT NULL", description: "Consolidated delivery destination." },
      { name: "ORDER_DATE", type: "TIMESTAMP", constraints: "DEFAULT CURRENT_TIMESTAMP NOT NULL", description: "Official transaction timestamp." },
      { name: "STATUS", type: "VARCHAR2(50)", constraints: "DEFAULT 'PENDING' NOT NULL", description: "Full order processing state (e.g. PENDING, CONFIRMED, COMPLETED, CANCELLED)." }
    ]
  },
  {
    name: "ORDER_ITEMS",
    description: "The multi-vendor structural bridge. Denormalizes vendor pointers so each merchant isolates and tracks only their line items.",
    columns: [
      { name: "ORDER_ITEM_ID", type: "NUMBER", constraints: "GENERATED AS IDENTITY (PK)", description: "Unique line item surrogate key." },
      { name: "ORDER_ID", type: "NUMBER", constraints: "NOT NULL (FK references ORDERS.ORDER_ID ON DELETE CASCADE)", description: "Pointer to consolidated parent order invoice." },
      { name: "PRODUCT_ID", type: "NUMBER", constraints: "NOT NULL (FK references PRODUCTS.PRODUCT_ID)", description: "Pointer to purchased product record." },
      { name: "VENDOR_ID", type: "NUMBER", constraints: "NOT NULL (FK references VENDORS.VENDOR_ID)", description: "Denormalized vendor ownership ID. Highly indexed for vendor dashboard queries." },
      { name: "QUANTITY", type: "NUMBER(6)", constraints: "NOT NULL (CHECK: > 0)", description: "Specific quantity purchased of this line product." },
      { name: "PRICE_AT_PURCHASE", type: "NUMBER(10,2)", constraints: "NOT NULL", description: "Historical cost locked at checkout, protecting records from future price fluctuations." },
      { name: "FULFILLMENT_STATUS", type: "VARCHAR2(50)", constraints: "DEFAULT 'PENDING' NOT NULL", description: "Vendor-specific shipment status (PENDING, PROCESSING, SHIPPED, DELIVERED)." }
    ]
  }
];

export const phase1Code = `-- ==========================================
-- PHASE 1: DATABASE RELATIONAL SCHEMA (Oracle SQL DDL)
-- Production-ready, fully-typed DDL with integrity constraints.
-- ==========================================

-- 1. Create Core Identity Table
CREATE TABLE USERS (
    USER_ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    EMAIL VARCHAR2(100) NOT NULL UNIQUE,
    PASSWORD_HASH VARCHAR2(255) NOT NULL,
    FULL_NAME VARCHAR2(150) NOT NULL,
    ROLE VARCHAR2(30) NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT CHECK_USER_ROLE CHECK (ROLE IN ('ROLE_ADMIN', 'ROLE_VENDOR', 'ROLE_CUSTOMER'))
);

-- 2. Create Vendor Profiles Table
-- Utilizes a 1:1 Shared Primary Key strategy with USERS to prevent profile orphan drift.
CREATE TABLE VENDORS (
    VENDOR_ID NUMBER PRIMARY KEY,
    COMPANY_NAME VARCHAR2(150) NOT NULL UNIQUE,
    STORE_DESCRIPTION VARCHAR2(1000),
    IS_APPROVED NUMBER(1) DEFAULT 0 NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT FK_VENDORS_USER FOREIGN KEY (VENDOR_ID) REFERENCES USERS(USER_ID) ON DELETE CASCADE,
    CONSTRAINT CHECK_VENDOR_APPROVAL CHECK (IS_APPROVED IN (0, 1))
);

-- 3. Create Products Table
-- Includes a 'VERSION' column mapping Hibernate @Version to enable high-concurrency Optimistic Locking.
CREATE TABLE PRODUCTS (
    PRODUCT_ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    VENDOR_ID NUMBER NOT NULL,
    NAME VARCHAR2(150) NOT NULL,
    DESCRIPTION VARCHAR2(1000),
    PRICE NUMBER(10, 2) NOT NULL,
    STOCK_LEVEL NUMBER(8) NOT NULL,
    VERSION NUMBER(10) DEFAULT 0 NOT NULL,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT FK_PRODUCTS_VENDOR FOREIGN KEY (VENDOR_ID) REFERENCES VENDORS(VENDOR_ID) ON DELETE CASCADE,
    CONSTRAINT CHECK_POSITIVE_PRICE CHECK (PRICE > 0),
    CONSTRAINT CHECK_NONNEGATIVE_STOCK CHECK (STOCK_LEVEL >= 0)
);

-- 4. Create Consolidated Orders Table
CREATE TABLE ORDERS (
    ORDER_ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    CUSTOMER_ID NUMBER NOT NULL,
    TOTAL_AMOUNT NUMBER(12, 2) NOT NULL,
    SHIPPING_ADDRESS VARCHAR2(500) NOT NULL,
    ORDER_DATE TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    STATUS VARCHAR2(50) DEFAULT 'PENDING' NOT NULL,
    CONSTRAINT FK_ORDERS_CUSTOMER FOREIGN KEY (CUSTOMER_ID) REFERENCES USERS(USER_ID)
);

-- 5. Create Order Items Bridge Table
-- Direct denormalization of VENDOR_ID onto line-items resolves the Multi-Vendor Containment boundary.
-- This ensures that Vendor A can query their inventory sales directly without performing complex joins 
-- back through PRODUCTS, while Customer can view the collective cart as a unified ORDER.
CREATE TABLE ORDER_ITEMS (
    ORDER_ITEM_ID NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    ORDER_ID NUMBER NOT NULL,
    PRODUCT_ID NUMBER NOT NULL,
    VENDOR_ID NUMBER NOT NULL,
    QUANTITY NUMBER(6) NOT NULL,
    PRICE_AT_PURCHASE NUMBER(10, 2) NOT NULL,
    FULFILLMENT_STATUS VARCHAR2(50) DEFAULT 'PENDING' NOT NULL,
    CONSTRAINT FK_ITEMS_ORDER FOREIGN KEY (ORDER_ID) REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE,
    CONSTRAINT FK_ITEMS_PRODUCT FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCTS(PRODUCT_ID),
    CONSTRAINT FK_ITEMS_VENDOR FOREIGN KEY (VENDOR_ID) REFERENCES VENDORS(VENDOR_ID),
    CONSTRAINT CHECK_POSITIVE_QTY CHECK (QUANTITY > 0)
);

-- Index denormalized VENDOR_ID on line items for rapid isolated order searches
CREATE INDEX IDX_ORDER_ITEMS_VENDOR ON ORDER_ITEMS(VENDOR_ID);
CREATE INDEX IDX_PRODUCTS_VENDOR ON PRODUCTS(VENDOR_ID);
`;

export const phase2Props = `# ==========================================
# PHASE 2: ORACLE DATABASE CONNECTION & JPA CONFIG
# Path: src/main/resources/application.properties
# ==========================================

# Database Driver and URL (Oracle XE local profile)
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url=jdbc:oracle:thin:@localhost:1521:XE
spring.datasource.username=system
spring.datasource.password=LocalDeveloperPass123!

# Connection Pool Settings (HikariCP for high throughput checkout loads)
spring.datasource.hikari.maximum-pool-size=25
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=20000

# Hibernate ORM Dialect Specific to Oracle
spring.jpa.database-platform=org.hibernate.dialect.OracleDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Batch fetching optimizations (reduces N+1 select queries)
spring.jpa.properties.hibernate.default_batch_fetch_size=16
`;

export const phase2Entities = `package com.platform.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "PRODUCTS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PRODUCT_ID")
    private Long id;

    @Column(name = "VENDOR_ID", nullable = false)
    private Long vendorId;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "STOCK_LEVEL", nullable = false)
    private Integer stockLevel;

    /**
     * Optimistic Locking Version Hook.
     * Prevents overlapping transactions from over-allocating warehouse stock levels.
     */
    @Version
    @Column(name = "VERSION")
    private Long version;

    @Column(name = "CREATED_AT", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;
}

// ==========================================
// ORDER ENTITY DECLARATION
// ==========================================
package com.platform.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ORDERS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ORDER_ID")
    private Long id;

    @Column(name = "CUSTOMER_ID", nullable = false)
    private Long customerId;

    @Column(name = "TOTAL_AMOUNT", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "SHIPPING_ADDRESS", nullable = false, length = 500)
    private String shippingAddress;

    @Column(name = "ORDER_DATE", nullable = false)
    private LocalDateTime orderDate;

    @Column(nullable = false, length = 50)
    private String status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    public void addOrderItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
}
`;

export const phase2LockingRepository = `package com.platform.ecommerce.repository;

import com.platform.ecommerce.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    /**
     * CONCURRENCY STRATEGY: Pessimistic Write Lock
     * -------------------------------------------------------------
     * Appends "FOR UPDATE" to the Oracle query block. Oracle database engine 
     * locks the matching row immediately. Any concurrent purchase threads attempting 
     * to write or acquire a lock on the same product ID must wait until this 
     * transaction completes (Commit or Rollback).
     *
     * Prevents over-selling stock during rapid checkout rushes (e.g. flash sales).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findAndLockById(@Param("id") Long id);
}
`;

export const phase3Code = `package com.platform.ecommerce.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomAuthenticationEntryPoint entryPoint;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, CustomAuthenticationEntryPoint entryPoint) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.entryPoint = entryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Disable CSRF - Session state is stored stateless on client using JWT
            .csrf(AbstractHttpConfigurer::disable)
            
            // 2. Exception Handling (Unauthorized hook)
            .exceptionHandling(ex -> ex.authenticationEntryPoint(entryPoint))
            
            // 3. Declare Stateless Session Management
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 4. Role-Based Path Rules (AntMatchers style)
            .authorizeHttpRequests(auth -> auth
                // Public catalog browsing is fully open
                .requestMatchers("/api/v1/public/**").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                
                // Admin platform and merchant-approval paths
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                
                // Vendor isolated stock management paths
                .requestMatchers("/api/v1/vendor/**").hasRole("VENDOR")
                
                // Customers placing checkouts and loading profiles
                .requestMatchers("/api/v1/customer/**").hasRole("CUSTOMER")
                
                // Fallback for security safety
                .anyRequest().authenticated()
            )
            
            // 5. Inject JWT validation filter before standard username password filter
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
`;

export const phase4Code = `package com.platform.ecommerce.service;

import com.platform.ecommerce.dto.CartItemRequest;
import com.platform.ecommerce.entity.Order;
import com.platform.ecommerce.entity.OrderItem;
import com.platform.ecommerce.entity.Product;
import com.platform.ecommerce.exception.InsufficientStockException;
import com.platform.ecommerce.exception.ProductNotFoundException;
import com.platform.ecommerce.repository.OrderRepository;
import com.platform.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    public CheckoutServiceImpl(ProductRepository productRepository, OrderRepository orderRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
    }

    /**
     * Atomic Multi-Vendor Purchase Processing.
     * -------------------------------------------------------------
     * @Transactional guarantees that the ENTIRE purchase succeeds or fails as a single unit.
     * If ANY product runs out of stock, the transaction is immediately rolled back, 
     * reverting all stock deductions and database writes, ensuring perfect Oracle integrity.
     */
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order processCheckout(Long customerId, List<CartItemRequest> items) {
        
        // 1. Initialize parent Order entity
        Order order = Order.builder()
                .customerId(customerId)
                .orderDate(LocalDateTime.now())
                .status("CONFIRMED")
                .totalAmount(BigDecimal.ZERO)
                .shippingAddress("123 Enterprise Parkway, Suite 500")
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        // 2. Process each item safely
        for (CartItemRequest cartItem : items) {
            
            // Fetch product using PESSIMISTIC LOCKING to secure the stock level
            Product product = productRepository.findAndLockById(cartItem.getProductId())
                    .orElseThrow(() -> new ProductNotFoundException("Product ID " + cartItem.getProductId() + " not found."));

            // Stock availability safety gate
            if (product.getStockLevel() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        String.format("Insufficient stock for '%s'. Requested: %d, Available: %d", 
                        product.getName(), cartItem.getQuantity(), product.getStockLevel())
                );
            }

            // Deduct from stock securely inside row-locked memory
            product.setStockLevel(product.getStockLevel() - cartItem.getQuantity());
            productRepository.save(product);

            // Calculate historical total
            BigDecimal itemCost = product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            runningTotal = runningTotal.add(itemCost);

            // Construct order item and link to denormalized Vendor reference
            OrderItem lineItem = OrderItem.builder()
                    .productId(product.getId())
                    .vendorId(product.getVendorId()) // Set denormalized bridge pointer
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(product.getPrice())
                    .fulfillmentStatus("PENDING")
                    .build();

            // Establish bidirectional JPA linking
            order.addOrderItem(lineItem);
        }

        // 3. Finalize Order amounts and persist to Oracle Database
        order.setTotalAmount(runningTotal);
        return orderRepository.save(order);
    }
}
`;

export const phase5ReactCode = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// =========================================================================
// PHASE 5: VendorInventoryManager.js
// Path: src/components/VendorInventoryManager.js
// -------------------------------------------------------------------------
// Standard, high-performance pure ES6 JavaScript (No TypeScript typings)
// Uses React hooks, Tailwind CSS, and Axios for live Oracle REST updates.
// =========================================================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function VendorInventoryManager({ vendorId, apiBaseUrl }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog state for adding/editing a product
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stockLevel: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Load Vendor inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, [vendorId]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Simulate/Trigger API call utilizing custom bearer tokens
      const token = localStorage.getItem('jwt_auth_token');
      const response = await fetch(\`\${apiBaseUrl}/api/v1/vendor/products?vendorId=\${vendorId}\`, {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load merchant inventory profile.');
      }
      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddDialog = () => {
    setEditingProduct(null);
    setFormData({ name: '', price: '', stockLevel: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stockLevel: product.stockLevel.toString(),
      description: product.description || ''
    });
    setIsDialogOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('jwt_auth_token');
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        stockLevel: parseInt(formData.stockLevel, 10),
        description: formData.description,
        vendorId: vendorId
      };

      let url = \`\${apiBaseUrl}/api/v1/vendor/products\`;
      let method = 'POST';

      if (editingProduct) {
        url = \`\${url}/\${editingProduct.id}\`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Could not persist product changes.');
      }

      setIsDialogOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;
    try {
      const token = localStorage.getItem('jwt_auth_token');
      const response = await fetch(\`\${apiBaseUrl}/api/v1/vendor/products/\${productId}\`, {
        method: 'DELETE',
        headers: {
          'Authorization': \`Bearer \${token}\`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product record.');
      }
      fetchInventory();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        <span className="ml-3 text-slate-400 font-mono text-sm">Querying Oracle DB...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl" id="vendor-mgr-container">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white tracking-tight" id="vendor-mgr-title">
            Inventory Manager
          </h2>
          <p className="text-slate-400 text-sm font-sans mt-1">
            Vendor Portal ID: <span className="font-mono text-indigo-400">{vendorId}</span>
          </p>
        </div>
        <button
          onClick={handleOpenAddDialog}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm py-2 px-4 rounded transition cursor-pointer"
          id="btn-add-product"
        >
          + Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-900 text-red-400 text-sm rounded p-4 mb-6 font-mono">
          [Oracle DB Error]: {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-slate-800 rounded">
          <p className="text-slate-400">No active warehouse stock records found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="tbl-inventory">
            <thead>
              <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-mono tracking-wider">
                <th className="py-3 px-4 font-semibold">Product Name</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-right">Price</th>
                <th className="py-3 px-4 font-semibold text-center">Stock Level</th>
                <th className="py-3 px-4 font-semibold text-center">Status Badge</th>
                <th className="py-3 px-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm text-slate-300">
              {products.map((p) => {
                const isLowStock = p.stockLevel <= 5;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-white">{p.name}</td>
                    <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">{p.description || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-indigo-300">
                      \${parseFloat(p.price).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">{p.stockLevel}</td>
                    <td className="py-3.5 px-4 text-center">
                      {isLowStock ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
                          ⚠️ Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          ✓ In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEditDialog(p)}
                          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="text-slate-400 hover:text-red-400 hover:bg-slate-800 p-1 rounded transition"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Dialog Modal Overlay */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingProduct ? 'Edit Warehouse Product' : 'Register New Catalog Product'}
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
                  placeholder="e.g. Mechanical Keyboard"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Warehouse Stock</label>
                  <input
                    type="number"
                    name="stockLevel"
                    required
                    value={formData.stockLevel}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Product Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
                  placeholder="Describe your specifications here..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 px-4 rounded transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Commit Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

VendorInventoryManager.propTypes = {
  vendorId: PropTypes.number.isRequired,
  apiBaseUrl: PropTypes.string.isRequired
};
`;

export const schemaRelationships = `
  [USERS]
     | (1:1 Extension via USER_ID -> VENDOR_ID)
     v
  [VENDORS]
     | (1:N Product Catalog)
     v
  [PRODUCTS]
     | (1:N Purchased Items)
     v
  [ORDER_ITEMS] <======== (N:1 Consolidated Bridge) ======= [ORDERS]
`;
