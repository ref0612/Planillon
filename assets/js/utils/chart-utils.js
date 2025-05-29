// Función principal para inicializar el gráfico
function initializeChart() {
  try {
      // Verificar si el canvas existe
      const canvas = document.getElementById('ocupacionChart');
      if (!canvas) {
          console.error('No se encontró el canvas para el gráfico');
          return null;
      }

      // Configuración del gráfico
      const ctx = canvas.getContext('2d');
      
      // Datos de ejemplo
      const labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
      const data = [
          { hour: '00:00', occupancy: 45, production: 1000000, incomePerKm: 1000 },
          { hour: '01:00', occupancy: 38, production: 850000, incomePerKm: 950 },
          { hour: '02:00', occupancy: 25, production: 400000, incomePerKm: 600 },
          { hour: '03:00', occupancy: 15, production: 250000, incomePerKm: 420 },
          { hour: '04:00', occupancy: 10, production: 200000, incomePerKm: 300 },
          { hour: '05:00', occupancy: 30, production: 600000, incomePerKm: 800 },
          { hour: '06:00', occupancy: 50, production: 1200000, incomePerKm: 1300 }
      ];

      // Inicializar el gráfico
      const chart = new Chart(ctx, {
          type: 'line',
          data: {
              labels: labels,
              datasets: [{
                  label: 'Factor de Ocupación (%)',
                  data: data.map(d => d.occupancy),
                  borderColor: '#dc2626',
                  backgroundColor: 'rgba(202, 22, 37, 0.2)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 4,
                  pointHoverRadius: 6,
              }]
          },
          options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                  mode: 'index',
                  intersect: false,
              },
              plugins: {
                  legend: {
                      display: false,
                      position: 'top',
                      labels: {
                          boxWidth: 20,
                          padding: 20,
                          font: {
                              size: 12
                          }
                      }
                  },
                  tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                      title: function(context) {
                        return `Hora: ${context[0].label}`;
                      },
                      label: function(context) {
                        const index = context.dataIndex;
                        const d = data[index]; // Accedemos al objeto completo de la hora
                  
                        const formatter = new Intl.NumberFormat('es-CL'); // Para formato 1.000.000
                  
                        return [
                          `Ocupación: $${d.occupancy}%`,
                          `Producción: $${formatter.format(d.production)}`,
                          `Ingreso/km: $${(d.incomePerKm / 1000).toFixed(3)}`
                        ];
                      }
                    }
                  }
                  
              },
              scales: {
                  y: {
                    title: {
                      display: true,
                      text: '% Ocupación'
                    },
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                          stepSize: 10,
                          callback: function(value) {
                              return value + '%';
                          }
                      },
                      grid: {
                          drawBorder: false
                      }
                  },
                  x: {
                      grid: {
                          display: true
                      },
                      ticks: {
                          font: {
                              size: 11
                          }
                      },
                      title: {
                          display: true,
                          text: 'Hora del día',
                          font: {
                              size: 12
                          }
                      }
                  }
              },
              layout: {
                  padding: {
                      left: 0,
                      right: 0,
                      top: 20,
                      bottom: 0
                  }
              }
          }
      });

      // Añadir evento para actualizar el gráfico cuando cambie el período
      const radioButtons = document.querySelectorAll('input[name="periodoView"]');
      if (radioButtons.length > 0) {
          radioButtons.forEach(radio => {
              radio.addEventListener('change', function() {
                  updateChartPeriod(this.id, chart, data);
              });
          });
      } else {
          console.warn('No se encontraron botones de período para el gráfico');
      }

      return chart;
  } catch (error) {
      console.error('Error al inicializar el gráfico:', error);
      return null;
  }
}

// Función para actualizar el gráfico cuando cambie el período
function updateChartPeriod(period, chart, data) {
  try {
      if (!chart) {
          console.error('El gráfico no está inicializado');
          return;
      }

      // Actualizar título del gráfico según el período
      chart.options.plugins.title.text = `Ocupación ${period === 'diarioView' ? 'por hora' : period === 'semanalView' ? 'por día' : 'mensual'}`;

      // Actualizar los datos según el período
      if (period === 'diarioView') {
          // Datos por horas
          chart.data.labels = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00'];
          chart.data.datasets[0].data = data.map(d => d.occupancy);
          chart.options.scales.x.title.text = 'Hora del día';
      } else if (period === 'semanalView') {
          // Datos por días
          chart.data.labels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
          chart.data.datasets[0].data = [45, 50, 55, 60, 65, 70, 75];
          chart.options.scales.x.title.text = 'Día de la semana';
      } else if (period === 'mensualView') {
          // Datos por semanas
          chart.data.labels = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'];
          chart.data.datasets[0].data = [55, 60, 65, 70];
          chart.options.scales.x.title.text = 'Semana del mes';
      }

      // Actualizar el gráfico
      chart.update();
  } catch (error) {
      console.error('Error al actualizar el gráfico:', error);
  }
}

// Hacer las funciones disponibles globalmente
window.initializeChart = initializeChart;
window.updateChartPeriod = updateChartPeriod;