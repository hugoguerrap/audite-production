// Script para completar el formulario automáticamente
async function completeFormQuickly() {
    // Función para hacer clic en siguiente
    const clickNext = () => {
        const nextButton = document.querySelector('button:contains("Siguiente"), button:contains("Finalizar")');
        if (nextButton && !nextButton.disabled) {
            nextButton.click();
            return true;
        }
        return false;
    };
    
    // Función para seleccionar "No sé" en preguntas de radio
    const selectNoSe = () => {
        const noSeRadio = document.querySelector('input[type="radio"][value*="No sé"], input[type="radio"] + label:contains("No sé")');
        if (noSeRadio) {
            noSeRadio.click();
            return true;
        }
        return false;
    };
    
    // Función para seleccionar "No sé" en dropdowns
    const selectNoSeDropdown = () => {
        const dropdown = document.querySelector('select, [role="combobox"]');
        if (dropdown) {
            dropdown.click();
            setTimeout(() => {
                const noSeOption = document.querySelector('[role="option"]:contains("No sé")');
                if (noSeOption) {
                    noSeOption.click();
                }
            }, 100);
            return true;
        }
        return false;
    };
    
    // Función para llenar campos de texto
    const fillTextField = (value = "Test") => {
        const textField = document.querySelector('input[type="text"], input[type="email"], input[type="tel"], textarea');
        if (textField) {
            textField.value = value;
            textField.dispatchEvent(new Event('input', { bubbles: true }));
            textField.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    };
    
    // Función para llenar campos numéricos
    const fillNumberField = (value = "100") => {
        const numberField = document.querySelector('input[type="number"]');
        if (numberField) {
            numberField.value = value;
            numberField.dispatchEvent(new Event('input', { bubbles: true }));
            numberField.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
        }
        return false;
    };
    
    console.log('Iniciando completado automático del formulario...');
    
    // Loop para completar todas las preguntas
    for (let i = 0; i < 20; i++) {  // Máximo 20 iteraciones por seguridad
        await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
        
        // Intentar diferentes tipos de inputs
        if (selectNoSe() || selectNoSeDropdown() || fillTextField("Test") || fillNumberField("100")) {
            await new Promise(resolve => setTimeout(resolve, 300)); // Esperar que se habilite el botón
            
            if (clickNext()) {
                console.log(`Pregunta ${i + 1} completada`);
                
                // Verificar si llegamos a la pantalla de finalización
                if (document.querySelector('h1:contains("Completado")') || 
                    document.querySelector('h1:contains("¡Autodiagnóstico Completado!")')) {
                    console.log('¡Formulario completado exitosamente!');
                    break;
                }
            } else {
                console.log('No se pudo hacer clic en siguiente, finalizando...');
                break;
            }
        } else {
            console.log('No se encontró input para completar, finalizando...');
            break;
        }
    }
}

// Ejecutar el script
completeFormQuickly();
