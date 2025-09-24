/**
 * SGP Performance - Biblioteca Rust para alta performance
 * Cálculos matemáticos, validações e processamento de dados otimizados
 */

use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use regex::Regex;
use std::collections::HashMap;

// Configuração global para logging
#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

macro_rules! console_log {
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

// ===== ESTRUTURAS DE DADOS =====

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dimension {
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AreaResult {
    pub area: f64,
    pub formatted_area: String,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoneyValue {
    pub raw_value: f64,
    pub formatted_value: String,
    pub cents: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProductionItem {
    pub id: Option<String>,
    pub tipo_producao: String,
    pub descricao: String,
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub valor: Option<f64>,
    pub valor_adicionais: Option<f64>,
    pub vendedor: Option<String>,
    pub designer: Option<String>,
    pub tecido: Option<String>,
    pub material: Option<String>,
    pub acabamentos: Option<HashMap<String, bool>>,
    pub ilhos_config: Option<IlhosConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IlhosConfig {
    pub quantidade: u32,
    pub valor_unitario: f64,
    pub distancia: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationResult {
    pub valid: bool,
    pub errors: Vec<String>,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatchCalculationResult {
    pub total_area: f64,
    pub total_value: f64,
    pub item_count: usize,
    pub items: Vec<ProductionItem>,
    pub calculation_time_ms: u64,
}

// ===== CÁLCULOS MATEMÁTICOS =====

/// Calcula área com alta precisão usando Rust
#[wasm_bindgen]
pub fn calculate_area(width: f64, height: f64) -> AreaResult {
    let area = width * height;
    let formatted_area = format_brazilian_decimal(area);
    
    AreaResult {
        area,
        formatted_area,
        width,
        height,
    }
}

/// Calcula área em lote para múltiplos itens
#[wasm_bindgen]
pub fn calculate_batch_areas(items: &JsValue) -> Result<JsValue, JsValue> {
    let items: Vec<Dimension> = items.into_serde()
        .map_err(|e| JsValue::from_str(&format!("Erro ao deserializar: {}", e)))?;
    
    let start = js_sys::Date::now();
    
    let results: Vec<AreaResult> = items
        .into_iter()
        .map(|dim| calculate_area(dim.width, dim.height))
        .collect();
    
    let end = js_sys::Date::now();
    let calculation_time = (end - start) as u64;
    
    console_log!("Calculadas {} áreas em {}ms", results.len(), calculation_time);
    
    JsValue::from_serde(&results)
        .map_err(|e| JsValue::from_str(&format!("Erro ao serializar: {}", e)))
}

// ===== PROCESSAMENTO DE VALORES MONETÁRIOS =====

/// Converte string brasileira para valor numérico com alta precisão
#[wasm_bindgen]
pub fn parse_brazilian_money(input: &str) -> MoneyValue {
    let cleaned = input
        .chars()
        .filter(|c| c.is_ascii_digit())
        .collect::<String>();
    
    if cleaned.is_empty() {
        return MoneyValue {
            raw_value: 0.0,
            formatted_value: "0,00".to_string(),
            cents: 0,
        };
    }
    
    let cents: u64 = cleaned.parse().unwrap_or(0);
    let value = cents as f64 / 100.0;
    let formatted = format_brazilian_money(value);
    
    MoneyValue {
        raw_value: value,
        formatted_value: formatted,
        cents,
    }
}

/// Formata valor numérico para formato brasileiro
#[wasm_bindgen]
pub fn format_brazilian_money(value: f64) -> String {
    format_brazilian_decimal(value)
}

/// Formata decimal para formato brasileiro (1.234,56)
fn format_brazilian_decimal(value: f64) -> String {
    let integer_part = value.floor() as i64;
    let fractional_part = ((value - integer_part as f64) * 100.0).round() as u64;
    
    let integer_str = format_number_with_dots(integer_part);
    format!("{},{:02}", integer_str, fractional_part)
}

/// Adiciona pontos como separadores de milhares
fn format_number_with_dots(number: i64) -> String {
    let mut result = String::new();
    let number_str = number.abs().to_string();
    let digits: Vec<char> = number_str.chars().collect();
    
    for (i, digit) in digits.iter().enumerate() {
        if i > 0 && (digits.len() - i) % 3 == 0 {
            result.push('.');
        }
        result.push(*digit);
    }
    
    if number < 0 {
        format!("-{}", result)
    } else {
        result
    }
}

/// Calcula total de valores monetários em lote
#[wasm_bindgen]
pub fn calculate_total_money(values: &JsValue) -> Result<JsValue, JsValue> {
    let values: Vec<String> = values.into_serde()
        .map_err(|e| JsValue::from_str(&format!("Erro ao deserializar: {}", e)))?;
    
    let start = js_sys::Date::now();
    
    let total = values
        .into_iter()
        .map(|v| parse_brazilian_money(&v).raw_value)
        .sum::<f64>();
    
    let end = js_sys::Date::now();
    let calculation_time = (end - start) as u64;
    
    let result = MoneyValue {
        raw_value: total,
        formatted_value: format_brazilian_money(total),
        cents: (total * 100.0) as u64,
    };
    
    console_log!("Calculado total de {} valores em {}ms", values.len(), calculation_time);
    
    JsValue::from_serde(&result)
        .map_err(|e| JsValue::from_str(&format!("Erro ao serializar: {}", e)))
}

// ===== VALIDAÇÕES DE ALTA PERFORMANCE =====

/// Valida dimensões com regras específicas
#[wasm_bindgen]
pub fn validate_dimensions(width: f64, height: f64) -> ValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    
    // Validações básicas
    if width <= 0.0 {
        errors.push("Largura deve ser maior que zero".to_string());
    }
    if height <= 0.0 {
        errors.push("Altura deve ser maior que zero".to_string());
    }
    if width > 1000.0 {
        errors.push("Largura muito grande (máximo 1000 cm)".to_string());
    }
    if height > 1000.0 {
        errors.push("Altura muito grande (máximo 1000 cm)".to_string());
    }
    
    // Warnings
    if width > 500.0 || height > 500.0 {
        warnings.push("Dimensões muito grandes, verifique se está correto".to_string());
    }
    
    ValidationResult {
        valid: errors.is_empty(),
        errors,
        warnings,
    }
}

/// Valida valor monetário
#[wasm_bindgen]
pub fn validate_money_value(value: f64) -> ValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    
    if value <= 0.0 {
        errors.push("Valor deve ser maior que zero".to_string());
    }
    if value > 999999.99 {
        errors.push("Valor muito alto (máximo R$ 999.999,99)".to_string());
    }
    
    if value > 10000.0 {
        warnings.push("Valor alto, confirme se está correto".to_string());
    }
    
    ValidationResult {
        valid: errors.is_empty(),
        errors,
        warnings,
    }
}

/// Valida configuração de ilhós
#[wasm_bindgen]
pub fn validate_ilhos_config(quantidade: u32, valor_unitario: f64, distancia: f64) -> ValidationResult {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();
    
    if quantidade == 0 {
        errors.push("Quantidade de ilhós deve ser maior que zero".to_string());
    }
    if quantidade > 100 {
        errors.push("Quantidade máxima de ilhós é 100".to_string());
    }
    if valor_unitario <= 0.0 {
        errors.push("Valor unitário deve ser maior que zero".to_string());
    }
    if distancia <= 0.0 {
        errors.push("Distância deve ser maior que zero".to_string());
    }
    
    if quantidade > 50 {
        warnings.push("Muitos ilhós, confirme se está correto".to_string());
    }
    
    ValidationResult {
        valid: errors.is_empty(),
        errors,
        warnings,
    }
}

// ===== PROCESSAMENTO DE DADOS EM LOTE =====

/// Processa múltiplos itens de produção em lote
#[wasm_bindgen]
pub fn process_production_batch(items: &JsValue) -> Result<JsValue, JsValue> {
    let items: Vec<ProductionItem> = items.into_serde()
        .map_err(|e| JsValue::from_str(&format!("Erro ao deserializar: {}", e)))?;
    
    let start = js_sys::Date::now();
    
    let mut total_area = 0.0;
    let mut total_value = 0.0;
    let mut processed_items = Vec::new();
    
    for item in items {
        // Calcular área se dimensões disponíveis
        if let (Some(width), Some(height)) = (item.width, item.height) {
            let area_result = calculate_area(width, height);
            total_area += area_result.area;
        }
        
        // Calcular valor total
        let item_value = item.valor.unwrap_or(0.0) + item.valor_adicionais.unwrap_or(0.0);
        total_value += item_value;
        
        processed_items.push(item);
    }
    
    let end = js_sys::Date::now();
    let calculation_time = (end - start) as u64;
    
    let result = BatchCalculationResult {
        total_area,
        total_value,
        item_count: processed_items.len(),
        items: processed_items,
        calculation_time_ms: calculation_time,
    };
    
    console_log!("Processados {} itens em {}ms", result.item_count, calculation_time);
    
    JsValue::from_serde(&result)
        .map_err(|e| JsValue::from_str(&format!("Erro ao serializar: {}", e)))
}

// ===== CACHE INTELIGENTE =====

/// Cache simples em memória para cálculos frequentes
static mut CALCULATION_CACHE: Option<HashMap<String, String>> = None;

#[wasm_bindgen]
pub fn get_cached_calculation(key: &str) -> Option<String> {
    unsafe {
        CALCULATION_CACHE
            .as_ref()
            .and_then(|cache| cache.get(key).cloned())
    }
}

#[wasm_bindgen]
pub fn set_cached_calculation(key: &str, value: &str) {
    unsafe {
        if CALCULATION_CACHE.is_none() {
            CALCULATION_CACHE = Some(HashMap::new());
        }
        if let Some(ref mut cache) = CALCULATION_CACHE {
            cache.insert(key.to_string(), value.to_string());
        }
    }
}

#[wasm_bindgen]
pub fn clear_calculation_cache() {
    unsafe {
        CALCULATION_CACHE = None;
    }
}

// ===== FUNÇÕES DE UTILIDADE =====

/// Converte string para número com tratamento de erro
#[wasm_bindgen]
pub fn parse_number_safe(input: &str) -> f64 {
    input
        .replace(",", ".")
        .replace(".", "")
        .parse::<f64>()
        .unwrap_or(0.0)
}

/// Verifica se string é um email válido
#[wasm_bindgen]
pub fn is_valid_email(email: &str) -> bool {
    let email_regex = Regex::new(r"^[^\s@]+@[^\s@]+\.[^\s@]+$").unwrap();
    email_regex.is_match(email)
}

/// Verifica se string é um CPF válido
#[wasm_bindgen]
pub fn is_valid_cpf(cpf: &str) -> bool {
    let cleaned = cpf.chars().filter(|c| c.is_ascii_digit()).collect::<String>();
    
    if cleaned.len() != 11 {
        return false;
    }
    
    // Verificar se todos os dígitos são iguais
    if cleaned.chars().all(|c| c == cleaned.chars().next().unwrap()) {
        return false;
    }
    
    // Algoritmo de validação do CPF
    let digits: Vec<u32> = cleaned.chars()
        .map(|c| c.to_digit(10).unwrap())
        .collect();
    
    // Calcular primeiro dígito verificador
    let mut sum = 0;
    for i in 0..9 {
        sum += digits[i] * (10 - i as u32);
    }
    let remainder = sum % 11;
    let first_digit = if remainder < 2 { 0 } else { 11 - remainder };
    
    if digits[9] != first_digit {
        return false;
    }
    
    // Calcular segundo dígito verificador
    let mut sum = 0;
    for i in 0..10 {
        sum += digits[i] * (11 - i as u32);
    }
    let remainder = sum % 11;
    let second_digit = if remainder < 2 { 0 } else { 11 - remainder };
    
    digits[10] == second_digit
}

// ===== FUNÇÕES DE BENCHMARK =====

/// Executa benchmark de performance
#[wasm_bindgen]
pub fn run_performance_benchmark(iterations: u32) -> String {
    let start = js_sys::Date::now();
    
    // Benchmark de cálculos de área
    for _ in 0..iterations {
        let _ = calculate_area(150.5, 200.75);
    }
    
    let area_time = js_sys::Date::now() - start;
    
    // Benchmark de formatação de moeda
    let start = js_sys::Date::now();
    for _ in 0..iterations {
        let _ = format_brazilian_money(1234.56);
    }
    
    let money_time = js_sys::Date::now() - start;
    
    format!(
        "Benchmark ({}) iteraciones:\nÁrea: {}ms\nMoeda: {}ms",
        iterations, area_time, money_time
    )
}

// ===== INICIALIZAÇÃO =====

#[wasm_bindgen(start)]
pub fn main() {
    console_log!("🚀 SGP Performance Engine inicializado com Rust!");
    console_log!("Versão: 0.1.0");
    console_log!("Funcionalidades disponíveis: cálculos, validações, cache");
}
