// ========== UTILIDADES DE FECHA Y HORA ==========
// Funciones para manejo y formateo de fechas y horas

// ========== FORMATEO DE FECHAS ==========
function formatDate(date, options = {}) {
    const defaultOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    try {
        const formatter = new Intl.DateTimeFormat('es-ES', finalOptions);
        let formatted = formatter.format(date);
        
        // Capitalizar la primera letra
        formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
        
        return formatted;
    } catch (error) {
        console.error('Error al formatear fecha:', error);
        return date.toString();
    }
}

function formatDateShort(date) {
    return formatDate(date, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTimeOnly(date) {
    return formatDate(date, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function formatDateTime(date) {
    return formatDate(date, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========== ACTUALIZACIÓN DEL RELOJ ==========
function updateDateTime() {
    const now = new Date();
    const dateTimeElement = document.getElementById('currentDateTime');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = formatDate(now);
    }
}

function startDateTimeClock() {
    // Actualizar inmediatamente
    updateDateTime();
    
    // Actualizar cada segundo
    setInterval(updateDateTime, 1000);
}

// ========== CONVERSIONES DE FECHA ==========
function parseDate(dateString) {
    try {
        return new Date(dateString);
    } catch (error) {
        console.error('Error al parsear fecha:', error);
        return new Date();
    }
}

function toISOString(date) {
    try {
        return date.toISOString();
    } catch (error) {
        console.error('Error al convertir a ISO:', error);
        return new Date().toISOString();
    }
}

function toDateInputValue(date) {
    try {
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error al convertir para input date:', error);
        return new Date().toISOString().split('T')[0];
    }
}

function toTimeInputValue(date) {
    try {
        return date.toTimeString().split(' ')[0].substring(0, 5);
    } catch (error) {
        console.error('Error al convertir para input time:', error);
        return '00:00';
    }
}

// ========== OPERACIONES CON FECHAS ==========
function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

function addHours(date, hours) {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
}

function addMinutes(date, minutes) {
    const result = new Date(date);
    result.setMinutes(result.getMinutes() + minutes);
    return result;
}

function subtractDays(date, days) {
    return addDays(date, -days);
}

function getDaysDifference(date1, date2) {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

function getHoursDifference(date1, date2) {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(timeDifference / (1000 * 3600));
}

// ========== VALIDACIONES DE FECHA ==========
function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isTomorrow(date) {
    const tomorrow = addDays(new Date(), 1);
    return date.toDateString() === tomorrow.toDateString();
}

function isYesterday(date) {
    const yesterday = subtractDays(new Date(), 1);
    return date.toDateString() === yesterday.toDateString();
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Domingo = 0, Sábado = 6
}

function isBusinessDay(date) {
    return !isWeekend(date);
}

// ========== FECHAS RELATIVAS ==========
function getRelativeTime(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'Hace un momento';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `Hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `Hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
}

// ========== RANGOS DE FECHA ==========
function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

function getWeekStart(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Lunes como primer día
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

function getWeekEnd(date) {
    const start = getWeekStart(date);
    return addDays(start, 6);
}

function getMonthStart(date) {
    const result = new Date(date);
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    return result;
}

function getMonthEnd(date) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + 1);
    result.setDate(0);
    result.setHours(23, 59, 59, 999);
    return result;
}

// ========== TIMEZONE UTILITIES ==========
function getCurrentTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function convertToTimezone(date, timezone) {
    try {
        return new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    } catch (error) {
        console.error('Error al convertir timezone:', error);
        return date;
    }
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar el reloj automáticamente
    startDateTimeClock();
    
    // Configurar inputs de fecha con valor por defecto
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = toDateInputValue(new Date());
        }
    });
});

// ========== EXPORTAR FUNCIONES ==========
window.DateTimeUtils = {
    formatDate,
    formatDateShort,
    formatTimeOnly,
    formatDateTime,
    updateDateTime,
    startDateTimeClock,
    parseDate,
    toISOString,
    toDateInputValue,
    toTimeInputValue,
    addDays,
    addHours,
    addMinutes,
    subtractDays,
    getDaysDifference,
    getHoursDifference,
    isValidDate,
    isToday,
    isTomorrow,
    isYesterday,
    isWeekend,
    isBusinessDay,
    getRelativeTime,
    getDateRange,
    getWeekStart,
    getWeekEnd,
    getMonthStart,
    getMonthEnd,
    getCurrentTimezone,
    convertToTimezone
};