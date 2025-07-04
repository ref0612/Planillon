// change-route.js
// Lógica dedicada para el flujo de Cambiar Ruta

class ChangeRouteHandler {
  constructor() {
    this.currentServiceData = null;
    this.citySequence = [];
    this.etapasPorCiudad = {};
    this.init();
  }

  init() {
    // Event delegation para botón Cambiar Ruta
    document.addEventListener('click', (e) => {
      const changeRouteButton = e.target.closest('.action-btn.btn-change-route');
      if (changeRouteButton) {
        this.handleChangeRouteClick(changeRouteButton, e);
      }
    });
  }

  handleChangeRouteClick(changeRouteButton, event) {
    event.preventDefault();
    event.stopPropagation();
    const row = changeRouteButton.closest('tr');
    if (!row) return;
    const serviceData = this.extractServiceData(row);
    this.showChangeRouteModal(serviceData);
  }

  extractServiceData(row) {
    const cells = row.cells;
    return {
      numero: cells[2]?.textContent?.trim() || '',
      fecha: new Date().toISOString().split('T')[0],
      variante: cells[3]?.textContent?.trim() || '',
      hora: cells[5]?.textContent?.trim() || '',
      chofer1: cells[6]?.textContent?.trim() || '',
      chofer2: '',
      bus: cells[4]?.textContent?.trim() || '',
      estado: row.querySelector('.status-indicator')?.classList.contains('status-alert') ? 'alerta' : 'normal'
    };
  }

  showChangeRouteModal(serviceData) {
    // Resetear estado
    this.citySequence = [];
    this.etapasPorCiudad = {};
    
    // Si ya existe el modal, lo eliminamos para evitar duplicados
    let existing = document.getElementById('changeRouteModal');
    if (existing) existing.remove();
    
    // Modal base
    const modalHtml = this.getChangeRouteModalHTML(serviceData);
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Inicializar Select2 en los selects múltiples
    setTimeout(() => {
      if (window.$ && window.$.fn && window.$.fn.select2) {
        function templateResultHideSelected(state, selected) {
          if (!state.id) return state.text;
          if (selected && selected.includes(state.id)) return null;
          return state.text;
        }
        function getSelectedValues(selectId) {
          return $(selectId).val() || [];
        }
        $('#changeRouteSkipCities').select2({
          theme: 'bootstrap-5',
          dropdownParent: $('#changeRouteModal'),
          placeholder: 'Selecciona ciudades...',
          width: '100%',
          allowClear: true,
          closeOnSelect: true,
          tags: false,
          templateResult: function(state) {
            return templateResultHideSelected(state, getSelectedValues('#changeRouteSkipCities'));
          },
          templateSelection: function(state) {
            return templateResultHideSelected(state, getSelectedValues('#changeRouteSkipCities'));
          }
        }).on('change', function() {
          const omitidas = $(this).val() || [];
          const paresSelect = $('#changeRouteSkipPairs');
          // Restaurar todas las opciones de ciudades posibles en el select de omitidas
          const allCities = ['Arica', 'Calama', 'Antofagasta', 'Algarrobo'];
          // Limpiar y volver a agregar todas las opciones
          $('#changeRouteSkipCities').empty();
          allCities.forEach(ciudad => {
            if (omitidas.includes(ciudad)) {
              $('#changeRouteSkipCities').append(`<option value="${ciudad}" selected>${ciudad}</option>`);
            } else {
              $('#changeRouteSkipCities').append(`<option value="${ciudad}">${ciudad}</option>`);
            }
          });
          // Refrescar Select2 y mantener seleccionadas las omitidas
          setTimeout(() => {
            $('#changeRouteSkipCities').val(omitidas).trigger('change.select2');
          }, 0);
          // Regenerar las opciones de pares válidos
          const ciudadesValidas = allCities.filter(c => !omitidas.includes(c));
          const pares = [];
          for (let i = 0; i < ciudadesValidas.length; i++) {
            for (let j = i + 1; j < ciudadesValidas.length; j++) {
              pares.push(`${ciudadesValidas[i]}-${ciudadesValidas[j]}`);
            }
          }
          const paresSeleccionados = paresSelect.val() || [];
          paresSelect.empty();
          pares.forEach(par => {
            paresSelect.append(`<option value="${par}">${par.replace(/-/g, ' - ')}</option>`);
          });
          // Mantener seleccionados solo los pares válidos
          const nuevos = paresSeleccionados.filter(par => pares.includes(par));
          paresSelect.val(nuevos).trigger('change.select2');
        });
        $('#changeRouteSkipPairs').select2({
          theme: 'bootstrap-5',
          dropdownParent: $('#changeRouteModal'),
          placeholder: 'Selecciona pares de ciudades...',
          width: '100%',
          allowClear: true,
          closeOnSelect: true,
          tags: false,
          templateResult: function(state) {
            return templateResultHideSelected(state, getSelectedValues('#changeRouteSkipPairs'));
          },
          templateSelection: function(state) {
            return templateResultHideSelected(state, getSelectedValues('#changeRouteSkipPairs'));
          }
        }).on('select2:select select2:unselect', function() {
          $(this).trigger('change.select2');
        });
        
        const rerenderOrganigram = () => {
          const omitCities = $('#changeRouteSkipCities').val() || [];
          const omitPairs = $('#changeRouteSkipPairs').val() || [];
          this.renderRouteOrganigram(serviceData, omitCities, omitPairs);
          // Actualizar secuencia de ciudades
          const allCities = ['Arica', 'Calama', 'Antofagasta', 'Algarrobo'];
          let filtered = allCities.filter(c => !omitCities.includes(c));
          if (omitPairs.length > 0 && filtered.length > 1) {
            let newFiltered = [filtered[0]];
            for (let i = 1; i < filtered.length; i++) {
              const prev = filtered[i-1];
              const curr = filtered[i];
              const tramo1 = `${prev}-${curr}`;
              const tramo2 = `${curr}-${prev}`;
              if (!omitPairs.includes(tramo1) && !omitPairs.includes(tramo2)) {
                newFiltered.push(curr);
              }
            }
            filtered = newFiltered;
          }
          document.getElementById('citySequenceSpan').innerHTML = filtered.map((c, i) => i < filtered.length-1 ? `${c} <span class=\"fa fa-angle-double-right\"></span>` : c).join(' ');
        };
        $('#changeRouteSkipCities').on('change', rerenderOrganigram);
        $('#changeRouteSkipPairs').on('change', rerenderOrganigram);
        // Log para depuración
        console.log('Eventos de cambio de omisión de ciudades y tramos configurados');
      }
    }, 200);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('changeRouteModal'));
    modal.show();
    
    // Render organigrama inicial
    setTimeout(() => {
      this.renderRouteOrganigram(serviceData, [], []);
    }, 100);
    
    // Configurar eventos de tabs
    this.setupTabEvents();
    
    // Configurar botones
    this.setupButtons();
  }

  setupTabEvents() {
    setTimeout(() => {
      const tabs = document.querySelectorAll('#changeRouteTabs .nav-link');
      tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', (e) => {
          tabs.forEach(t => t.classList.remove('tab-red-underline'));
          tabs.forEach(t => t.classList.add('tab-gray'));
          e.target.classList.add('tab-red-underline');
          e.target.classList.remove('tab-gray');
          
          // Botón de navegación
          const saveBtn = document.getElementById('saveChangeRouteBtn');
          const nextBtn = document.getElementById('nextChangeRouteBtn');
          if (e.target.id === 'info-tab') {
            saveBtn.classList.add('d-none');
            nextBtn.classList.remove('d-none');
          } else if (e.target.id === 'stages-tab') {
            saveBtn.classList.remove('d-none');
            nextBtn.classList.add('d-none');
            // Renderizar etapas si hay secuencia de ciudades
            if (this.citySequence.length > 0) {
              this.renderStagesTab();
            }
          }
        });
      });
      
      // Estado inicial: solo botón siguiente
      document.getElementById('saveChangeRouteBtn').classList.add('d-none');
      document.getElementById('nextChangeRouteBtn').classList.remove('d-none');
    }, 300);
  }

  setupButtons() {
    // Botón siguiente
    setTimeout(() => {
      const nextBtn = document.getElementById('nextChangeRouteBtn');
      if (nextBtn) {
        nextBtn.onclick = () => {
          console.log('Botón Siguiente clickeado');
          // Obtener la secuencia de ciudades actual (después de omisiones)
          const citySequenceSpan = document.getElementById('citySequenceSpan');
          if (citySequenceSpan) {
            // Extraer solo los nombres de ciudad, ignorando los íconos y separadores
            // Usar querySelectorAll para obtener solo los nodos de texto
            let cities = [];
            citySequenceSpan.childNodes.forEach(node => {
              if (node.nodeType === Node.TEXT_NODE) {
                // Puede haber varios nombres juntos, separarlos por espacios
                node.textContent.split(/\s+/).forEach(c => {
                  if (c && c.trim()) cities.push(c.trim());
                });
              } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'SPAN') {
                // ignorar los <span> (son los íconos)
              }
            });
            this.citySequence = cities;
            console.log('Secuencia de ciudades:', this.citySequence);
            // Validar que hay ciudades en la secuencia
            if (this.citySequence.length === 0) {
              alert('Error: No hay ciudades en la secuencia. Por favor, revisa las ciudades omitidas.');
              return;
            }
            // Inicializar etapas por ciudad
            this.initializeEtapasPorCiudad();
            // Cambiar al tab de Etapas
            const stagesTab = document.getElementById('stages-tab');
            if (stagesTab) {
              const tab = new bootstrap.Tab(stagesTab);
              tab.show();
            }
          } else {
            console.error('No se encontró el elemento citySequenceSpan');
            alert('Error: No se pudo obtener la secuencia de ciudades.');
          }
        };
        console.log('Event listener del botón Siguiente agregado');
      } else {
        console.error('No se encontró el botón Siguiente');
      }
    }, 500);
    
    // Botón guardar cambios
    setTimeout(() => {
      const saveBtn = document.getElementById('saveChangeRouteBtn');
      if (saveBtn) {
        saveBtn.onclick = () => {
          console.log('Guardando cambios de ruta...');
          // Aquí puedes poner la lógica de guardado real
          const modal = bootstrap.Modal.getInstance(document.getElementById('changeRouteModal'));
          if (modal) modal.hide();
        };
      }
    }, 500);
  }

  initializeEtapasPorCiudad() {
    this.etapasPorCiudad = {};
    this.citySequence.forEach(city => {
      this.etapasPorCiudad[city] = [
        {
          nombre: city,
          distancia: 0,
          duracionH: '01',
          duracionM: '00',
          esperaH: '00',
          esperaM: '00',
          subida: true,
          bajada: false,
          intermedio: true,
          editando: false
        }
      ];
    });
  }

  renderStagesTab() {
    const dynamicContent = document.getElementById('dynamicStagesContent');
    if (!dynamicContent) return;
    
    let embarqueH = '00', embarqueM = '00';
    const html = this.generateStagesHTML(embarqueH, embarqueM);
    dynamicContent.innerHTML = html;
    
    // Adjuntar eventos después del renderizado
    setTimeout(() => {
      this.attachStagesEvents(embarqueH, embarqueM);
    }, 100);
  }

  generateStagesHTML(embarqueH, embarqueM) {
    let embarqueInicial = parseInt(embarqueH) * 60 + parseInt(embarqueM);
    let { tiemposPorCiudad, tiempoTotal } = this.calcularTiempos(embarqueInicial);
    let html = '';
    html += `<div class="container-fluid px-0" style="font-size:0.70rem;">`;
    html += `<div class="row mb-2"><div class="col-12 d-flex align-items-center justify-content-between">`;
    html += `<h6 class="fw-normal mb-0" style="font-size:0.70rem;letter-spacing:0.2px;">Etapas de la Ruta</h6>`;
    html += `<span class="badge bg-primary shadow-sm" style="font-size:0.70rem;padding:5px 8px;">Tiempo total: <b>${tiempoTotal} hrs</b></span>`;
    html += `</div></div>`;
    html += `<div class="row mb-2"><div class="col-12 d-flex align-items-center">`;
    html += `<label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Embarque inicial</label>`;
    html += `<div class="d-flex align-items-center mb-2">`;
    html += `<select id="embarqueH" class="form-select form-select-sm d-inline-block text-center" style="width:48px;padding:2px 4px;">`;
    for(let h=0; h<24; h++) {
      let hStr = h.toString().padStart(2,'0');
      html += `<option value="${hStr}"${embarqueH==hStr?' selected':''}>${hStr}</option>`;
    }
    html += `</select> : `;
    html += `<select id="embarqueM" class="form-select form-select-sm d-inline-block text-center" style="width:48px;padding:2px 4px;">`;
    for(let m=0; m<60; m++) {
      let mStr = m.toString().padStart(2,'0');
      html += `<option value="${mStr}"${embarqueM==mStr?' selected':''}>${mStr}</option>`;
    }
    html += `</select>`;
    html += `</div>`;
    html += `</div></div>`;
    html += `<div class="etapas-list accordion" id="accordionCiudades">`;
    Object.entries(this.etapasPorCiudad).forEach(([city, etapas], cidx) => {
      const collapseId = `collapseCiudad${cidx}`;
      const headingId = `headingCiudad${cidx}`;
      html += `<div class="accordion-item mb-2 border-0">`;
      html += `<h2 class="accordion-header" id="${headingId}">`;
      html += `<button class="accordion-button collapsed py-2 px-3" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}" style="background:#f8f9fa;font-size:0.95rem;">`;
      html += `<span class='me-2'><i class='fas fa-caret-down'></i></span><i class="fas fa-city me-2 text-secondary"></i>${city} <small class="text-muted ms-2">(${etapas.length} Etapa${etapas.length>1?'s':''})</small>`;
      html += `</button></h2>`;
      html += `<div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}">`;
      html += `<div class="accordion-body p-2 pb-1" style="font-size:0.70rem;">`;
      html += `<div class="d-flex justify-content-end mb-2"><button type="button" class="btn btn-success btn-xs btn-add-etapa px-2 py-1" data-ciudad="${city}" style="font-size:0.70rem;"><i class="fa fa-plus"></i> Añadir</button></div>`;
      html += `<div class="table-responsive"><table class="table table-bordered table-hover table-sm align-middle mb-0" style="background:#fff;font-size:0.70rem;">`;
      html += `<thead class="table-light"><tr style="font-size:0.70rem;">`;
      html += `<th class="text-center" style="width:32px;">#</th><th class="text-center" style="width:180px;white-space:nowrap;">Etapa</th><th class="text-center" style="width:70px;">Distancia<br><small>(Km)</small></th><th class="text-center" style="width:90px;">Duración<br><small>(HH:MM)</small></th><th class="text-center" style="width:90px;">Espera<br><small>(HH:MM)</small></th><th class="text-center" style="width:60px;">Llegada</th><th class="text-center" style="width:60px;">Embarque</th><th class="text-center" style="width:40px;">Subida</th><th class="text-center" style="width:40px;">Bajada</th><th class="text-center" style="width:40px;">Int.</th><th style="width:32px;"></th>`;
      html += `</tr></thead><tbody id="tbody-${city}">`;
      etapas.forEach((etapa, eidx) => {
        let t = tiemposPorCiudad[city][eidx];
        html += `<tr data-ciudad="${city}" data-idx="${eidx}" draggable="true">`;
        html += `<td class="text-center">${eidx+1}</td>`;
        if(etapa.editando){
          html += `<td class="text-center fw-normal" style="width:180px;white-space:nowrap;"><input type="text" class="form-control form-control-sm text-center etapa-nombre" value=""></td>`;
        }else{
          html += `<td class="text-center fw-normal" style="width:180px;white-space:nowrap;">${etapa.nombre}</td>`;
        }
        html += `<td><input type="text" class="form-control form-control-sm text-center etapa-distancia" style="max-width:60px;padding:2px 4px;" value="${etapa.distancia}" size="4"></td>`;
        html += `<td>`;
        // Duración: si es la primera ciudad y la primera etapa, mostrar 00:00 fijo y deshabilitado
        if (cidx === 0 && eidx === 0) {
          html += `<select class='form-select form-select-sm d-inline-block text-center etapa-dur-h' style='width:48px;padding:2px 4px;' disabled><option value='00' selected>00</option></select> : `;
          html += `<select class='form-select form-select-sm d-inline-block text-center etapa-dur-m' style='width:48px;padding:2px 4px;' disabled><option value='00' selected>00</option></select>`;
        } else {
          html += `<select class="form-select form-select-sm d-inline-block text-center etapa-dur-h" style="width:48px;padding:2px 4px;">`;
          for(let h=0; h<24; h++) {
            let hStr = h.toString().padStart(2,'0');
            html += `<option value="${hStr}"${etapa.duracionH==hStr?' selected':''}>${hStr}</option>`;
          }
          html += `</select> : `;
          html += `<select class="form-select form-select-sm d-inline-block text-center etapa-dur-m" style="width:48px;padding:2px 4px;">`;
          for(let m=0; m<60; m++) {
            let mStr = m.toString().padStart(2,'0');
            html += `<option value="${mStr}"${etapa.duracionM==mStr?' selected':''}>${mStr}</option>`;
          }
          html += `</select>`;
        }
        html += `</td>`;
        html += `<td>`;
        if (cidx === Object.entries(this.etapasPorCiudad).length - 1 && eidx === etapas.length - 1) {
          html += `<select class='form-select form-select-sm d-inline-block text-center etapa-esp-h' style='width:48px;padding:2px 4px;' disabled><option value='00' selected>00</option></select> : `;
          html += `<select class='form-select form-select-sm d-inline-block text-center etapa-esp-m' style='width:48px;padding:2px 4px;' disabled><option value='00' selected>00</option></select>`;
        } else {
          html += `<select class="form-select form-select-sm d-inline-block text-center etapa-esp-h" style="width:48px;padding:2px 4px;">`;
          for(let h=0; h<24; h++) {
            let hStr = h.toString().padStart(2,'0');
            html += `<option value="${hStr}"${etapa.esperaH==hStr?' selected':''}>${hStr}</option>`;
          }
          html += `</select> : `;
          html += `<select class="form-select form-select-sm d-inline-block text-center etapa-esp-m" style="width:48px;padding:2px 4px;">`;
          for(let m=0; m<60; m++) {
            let mStr = m.toString().padStart(2,'0');
            html += `<option value="${mStr}"${etapa.esperaM==mStr?' selected':''}>${mStr}</option>`;
          }
          html += `</select>`;
        }
        html += `</td>`;
        html += `<td class="text-center">`;
        if (cidx === 0 && eidx === 0) {
          html += `-`;
        } else {
          html += `<span class="arr_time rec" style="font-size:0.70em;">${t.llegada}</span>`;
        }
        html += `</td>`;
        html += `<td class="text-center">`;
        if (cidx === 0 && eidx === 0) {
          html += `<span class="calc_time rec fw-bold text-primary" style="font-size:0.85em;">${document.getElementById('embarqueH')?.value.padStart(2,'0') || '00'}:${document.getElementById('embarqueM')?.value.padStart(2,'0') || '00'}</span>`;
        } else {
          html += `<span class="calc_time rec" style="font-size:0.70em;">${t.embarque}</span>`;
        }
        html += `</td>`;
        html += `<td class="text-center"><input type="radio" name="subida_${city}_${eidx}" class="etapa-subida" ${etapa.subida?'checked':''}></td>`;
        html += `<td class="text-center"><input type="radio" name="bajada_${city}_${eidx}" class="etapa-bajada" ${etapa.bajada?'checked':''}></td>`;
        html += `<td class="text-center"><input type="checkbox" class="etapa-int" ${etapa.intermedio?'checked':''}></td>`;
        html += `<td class="text-center"><button type="button" class="btn btn-danger btn-xs btn-del-etapa" data-ciudad="${city}" data-idx="${eidx}" title="Eliminar etapa"><i class="fa fa-trash"></i></button></td>`;
        html += `</tr>`;
      });
      html += `</tbody></table></div></div></div></div></div>`;
    });
    html += `</div></div>`;
    return html;
  }

  calcularTiempos(embarqueInicial) {
    let tiemposPorCiudad = {};
    let totalMin = 0;
    let currentMin = embarqueInicial;
    let isFirst = true;
    const ciudades = Object.entries(this.etapasPorCiudad);
    let lastEmbarque = embarqueInicial;
    ciudades.forEach(([city, etapas], cidx) => {
      tiemposPorCiudad[city] = [];
      etapas.forEach((etapa, idx) => {
        let dur = parseInt(etapa.duracionH) * 60 + parseInt(etapa.duracionM);
        let esp = parseInt(etapa.esperaH) * 60 + parseInt(etapa.esperaM);
        let llegada, embarque;
        // Primera etapa de la primera ciudad
        if (isFirst && idx === 0) {
          llegada = '-';
          embarque = this.toHHMM(embarqueInicial);
          etapa.duracionH = '00';
          etapa.duracionM = '00';
          etapa.esperaH = '00';
          etapa.esperaM = '00';
        } else {
          llegada = this.toHHMM(lastEmbarque + dur);
          embarque = this.toHHMM(lastEmbarque + dur + esp);
        }
        // Solo la última etapa de la última ciudad debe estar freezed en espera
        if (cidx === ciudades.length - 1 && idx === etapas.length - 1) {
          etapa.esperaH = '00';
          etapa.esperaM = '00';
        }
        tiemposPorCiudad[city].push({
          llegada,
          embarque
        });
        // Sumar duración y espera de cada etapa al acumulado
        if (isFirst && idx === 0) {
          isFirst = false;
        } else {
          lastEmbarque = lastEmbarque + dur + esp;
          currentMin = lastEmbarque;
          totalMin += dur + esp;
        }
      });
    });
    return { tiemposPorCiudad, tiempoTotal: this.toHHMM(totalMin) };
  }

  toHHMM(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
  }

  attachStagesEvents(embarqueH, embarqueM) {
    // Embarque inicial
    const embarqueHElem = document.getElementById('embarqueH');
    const embarqueMElem = document.getElementById('embarqueM');
    
    if (embarqueHElem) {
      embarqueHElem.addEventListener('change', (e) => {
        embarqueH = e.target.value.padStart(2,'0');
        this.rerenderStages(embarqueH, embarqueM);
      });
    }
    
    if (embarqueMElem) {
      embarqueMElem.addEventListener('change', (e) => {
        embarqueM = e.target.value.padStart(2,'0');
        this.rerenderStages(embarqueH, embarqueM);
      });
    }
    
    // Añadir etapa
    document.querySelectorAll('.btn-add-etapa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const city = e.target.closest('.btn-add-etapa').getAttribute('data-ciudad');
        // Mostrar popup para ingresar nombre
        const nombre = prompt('Ingrese el nombre de la nueva etapa:');
        if (nombre && nombre.trim().length > 0) {
          this.etapasPorCiudad[city].push({
            nombre: nombre.trim(),
            distancia: 0,
            duracionH: '01',
            duracionM: '00',
            esperaH: '00',
            esperaM: '00',
            subida: false,
            bajada: false,
            intermedio: true,
            editando: false
          });
          this.rerenderStages(embarqueH, embarqueM);
        }
      });
    });
    
    // Guardar nombre de nueva etapa
    document.querySelectorAll('.etapa-nombre').forEach(inp => {
      inp.addEventListener('blur', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city][idx].nombre = e.target.value;
        this.etapasPorCiudad[city][idx].editando = false;
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    // Eliminar etapa
    document.querySelectorAll('.btn-del-etapa').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const city = e.target.closest('.btn-del-etapa').getAttribute('data-ciudad');
        const idx = parseInt(e.target.closest('.btn-del-etapa').getAttribute('data-idx'));
        this.etapasPorCiudad[city].splice(idx, 1);
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    // Inputs editables (excepto nombre)
    document.querySelectorAll('.etapa-distancia').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city][idx].distancia = e.target.value;
      });
    });
    
    document.querySelectorAll('.etapa-dur-h, .etapa-dur-m').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city][idx].duracionH = tr.querySelector('.etapa-dur-h').value.padStart(2,'0');
        this.etapasPorCiudad[city][idx].duracionM = tr.querySelector('.etapa-dur-m').value.padStart(2,'0');
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    // Radios y checkboxes
    document.querySelectorAll('.etapa-subida').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city].forEach((et, i) => et.subida = (i === idx));
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    document.querySelectorAll('.etapa-bajada').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city].forEach((et, i) => et.bajada = (i === idx));
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    document.querySelectorAll('.etapa-int').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city][idx].intermedio = e.target.checked;
      });
    });
    
    document.querySelectorAll('.etapa-esp-h, .etapa-esp-m').forEach(inp => {
      inp.addEventListener('change', (e) => {
        const tr = e.target.closest('tr');
        const city = tr.getAttribute('data-ciudad');
        const idx = parseInt(tr.getAttribute('data-idx'));
        this.etapasPorCiudad[city][idx].esperaH = tr.querySelector('.etapa-esp-h').value.padStart(2,'0');
        this.etapasPorCiudad[city][idx].esperaM = tr.querySelector('.etapa-esp-m').value.padStart(2,'0');
        this.rerenderStages(embarqueH, embarqueM);
      });
    });
    
    // Drag & drop reordenar etapas dentro de la ciudad
    Object.keys(this.etapasPorCiudad).forEach(city => {
      const tbody = document.getElementById(`tbody-${city}`);
      if (!tbody) return;
      
      let dragIdx = null;
      tbody.querySelectorAll('tr').forEach((tr, idx) => {
        tr.addEventListener('dragstart', (e) => { dragIdx = idx; });
        tr.addEventListener('dragover', (e) => { e.preventDefault(); });
        tr.addEventListener('drop', (e) => {
          e.preventDefault();
          if (dragIdx === null) return;
          const dropIdx = idx;
          if (dragIdx !== dropIdx) {
            const arr = this.etapasPorCiudad[city];
            const [moved] = arr.splice(dragIdx, 1);
            arr.splice(dropIdx, 0, moved);
            this.rerenderStages(embarqueH, embarqueM);
          }
          dragIdx = null;
        });
      });
    });
  }

  rerenderStages(embarqueH, embarqueM) {
    // Guardar el estado expandido de los acordeones
    const expanded = {};
    document.querySelectorAll('.accordion-collapse').forEach(acc => {
      if (acc.classList.contains('show')) {
        expanded[acc.id] = true;
      }
    });
    const dynamicContent = document.getElementById('dynamicStagesContent');
    if (!dynamicContent) return;
    dynamicContent.innerHTML = this.generateStagesHTML(embarqueH, embarqueM);
    // Restaurar el estado expandido
    Object.keys(expanded).forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.classList.contains('show')) {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, {toggle: false});
        bsCollapse.show();
      }
    });
    setTimeout(() => {
      this.attachStagesEvents(embarqueH, embarqueM);
    }, 100);
  }

  getChangeRouteModalHTML(serviceData) {
    const allCities = ['Arica', 'Calama', 'Antofagasta', 'Algarrobo'];
    return `
      <div class="modal fade change-route-modal" id="changeRouteModal" tabindex="-1" aria-labelledby="changeRouteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content" style="border-radius:16px;border:none;box-shadow:0 8px 32px rgba(0,0,0,0.12);">
            <div class="modal-header" style="border-bottom:1px solid #e9ecef;padding:1.5rem 2rem 1rem;background:#f6f7fa;">
              <h5 class="modal-title fw-bold text-dark" id="changeRouteModalLabel" style="font-size:20px;letter-spacing:0.5px;">
                Cambiar Ruta
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0" style="background:#f8f9fb;">
              <div class="px-4 pt-3 pb-2">
                <ul class="nav nav-tabs border-0 bg-transparent px-0" id="changeRouteTabs" role="tablist" style="border-bottom:none;background:transparent;">
                  <li class="nav-item" role="presentation">
                    <button class="nav-link active tab-red-underline" id="info-tab" data-bs-toggle="tab" data-bs-target="#info" type="button" role="tab" aria-controls="info" aria-selected="true" style="font-size:16px;font-weight:600;background:transparent;border:none;border-bottom:3px solid #d32f2f;color:#d32f2f;padding:0.75rem 2.2rem 0.5rem 0;">
                      Información General
                    </button>
                  </li>
                  <li class="nav-item" role="presentation">
                    <button class="nav-link tab-gray" id="stages-tab" data-bs-toggle="tab" data-bs-target="#stages" type="button" role="tab" aria-controls="stages" aria-selected="false" style="font-size:16px;font-weight:600;background:transparent;border:none;border-bottom:3px solid transparent;color:#7b809a;padding:0.75rem 2.2rem 0.5rem 0;">
                      Etapas
                    </button>
                  </li>
                </ul>
                <div class="mt-2 mb-3">
                  <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Servicio</label>
                  <span class="fw-semibold bg-white border border-1 rounded-2 px-3 py-1 d-inline-block align-middle" style="font-size:15px;color:#222;min-width:180px;">${serviceData.numero}</span>
                </div>
              </div>
              <div class="tab-content px-4 pb-4" id="changeRouteTabContent">
                <div class="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                  <div class="card mb-3" style="border-radius:14px;background:#f8f9fb;border:none;">
                    <div class="card-body pb-2 pt-3 px-4">
                      <form id="changeRouteForm">
                        <div class="row g-3 align-items-end">
                          <div class="col-md-4">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Ruta</label>
                            <select class="form-select form-select-sm fw-semibold fs-13" style="font-size:13px;background:#fff;cursor:pointer;border:1px solid #d1d5db;" id="changeRouteRuta">
                              <option value="Autopista X Pardo" ${serviceData.variante === 'Autopista X Pardo' ? 'selected' : ''}>Autopista X Pardo</option>
                              <option value="Ruta 2" ${serviceData.variante === 'Ruta 2' ? 'selected' : ''}>Ruta 2</option>
                              <option value="Ruta 3" ${serviceData.variante === 'Ruta 3' ? 'selected' : ''}>Ruta 3</option>
                              <option value="Ruta 4" ${serviceData.variante === 'Ruta 4' ? 'selected' : ''}>Ruta 4</option>
                            </select>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Origen</label>
                            <select class="form-select form-select-sm fw-semibold fs-13" style="font-size:13px;background:#fff;cursor:pointer;border:1px solid #d1d5db;" id="changeRouteOrigin">
                              <option value="Arica">Arica</option>
                              <option value="Calama">Calama</option>
                              <option value="Antofagasta">Antofagasta</option>
                              <option value="Algarrobo">Algarrobo</option>
                            </select>
                          </div>
                          <div class="col-md-4">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Destino</label>
                            <select class="form-select form-select-sm fw-semibold fs-13" style="font-size:13px;background:#fff;cursor:pointer;border:1px solid #d1d5db;" id="changeRouteDestination">
                              <option value="Arica">Arica</option>
                              <option value="Calama">Calama</option>
                              <option value="Antofagasta">Antofagasta</option>
                              <option value="Algarrobo">Algarrobo</option>
                            </select>
                          </div>
                        </div>
                        <div class="row g-3 mt-1 align-items-end">
                          <div class="col-md-6">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Ciudades omitidas</label>
                            <select class="form-select form-select-sm select2-multi fw-semibold fs-13" style="font-size:13px;background:#fff;cursor:pointer;border:1px solid #d1d5db;" id="changeRouteSkipCities" multiple data-placeholder="Selecciona ciudades...">
                              <option value="Calama">Calama</option>
                              <option value="Antofagasta">Antofagasta</option>
                              <option value="Viña del Mar">Viña del Mar</option>
                              <option value="Valparaíso">Valparaíso</option>
                            </select>
                            <div class="helper-text fs-10 mg-l-5">Puedes seleccionar varias ciudades</div>
                          </div>
                          <div class="col-md-6">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Omitir tramos</label>
                            <select class="form-select form-select-sm select2-multi fw-semibold fs-13" style="font-size:13px;background:#fff;cursor:pointer;border:1px solid #d1d5db;" id="changeRouteSkipPairs" multiple data-placeholder="Selecciona pares de ciudades...">
                              <option value="Arica-Calama">Arica - Calama</option>
                              <option value="Arica-Antofagasta">Arica - Antofagasta</option>
                              <option value="Calama-Antofagasta">Calama - Antofagasta</option>
                              <option value="Calama-Algarrobo">Calama - Algarrobo</option>
                              <option value="Antofagasta-Algarrobo">Antofagasta - Algarrobo</option>
                            </select>
                            <div class="helper-text fs-10 mg-l-5">Puedes seleccionar varios pares de ciudades</div>
                          </div>
                        </div>
                        <div class="row g-3 mt-1">
                          <div class="col-md-12">
                            <label class="form-label text-uppercase text-muted mb-1" style="font-size:12px;letter-spacing:1px;">Secuencia de ciudades</label>
                            <div id="citySequenceSpan" class="fw-semibold text-dark bg-light border-0 rounded-3 px-3 py-2 fs-13" style="font-size:13px;">${allCities.join(' <span class=\"fa fa-angle-double-right\"></span> ')}</div>
                          </div>
                        </div>
                        <div class="row g-3 mt-1">
                          <div class="col-md-12">
                            <div id="changeRouteOrganigram"></div>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div class="tab-pane fade" id="stages" role="tabpanel" aria-labelledby="stages-tab">
                  <div class="card mb-3" style="border-radius:14px;background:#fff;border:none;">
                    <div class="card-body pb-2 pt-3 px-4">
                      <div id="dynamicStagesContent"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer" style="border-top:1px solid #e9ecef;padding:1rem 2rem 1.5rem;background:#f6f7fa;">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal" style="border-radius:8px;padding:0.6rem 2rem;font-weight:500;font-size:16px;">Cancelar</button>
              <button type="button" class="btn btn-primary" id="nextChangeRouteBtn" style="border-radius:8px;padding:0.6rem 2rem;font-weight:500;font-size:16px;">Siguiente</button>
              <button type="button" class="btn btn-primary d-none" id="saveChangeRouteBtn" style="border-radius:8px;padding:0.6rem 2rem;font-weight:500;font-size:16px;">Guardar Cambios</button>
            </div>
          </div>
        </div>
      </div>
      <style>
        .tab-red-underline { color: #d32f2f !important; border-bottom: 3px solid #d32f2f !important; background: transparent !important; }
        .tab-gray { color: #7b809a !important; border-bottom: 3px solid transparent !important; background: transparent !important; }
        .nav-tabs .nav-link { transition: color 0.2s, border-bottom 0.2s; }
      </style>
    `;
  }

  renderRouteOrganigram(serviceData, omitCities = [], omitPairs = []) {
    const organigram = document.getElementById('changeRouteOrganigram');
    if (!organigram) return;
    
    // Ejemplo de datos (puedes reemplazar por los reales)
    const treeData = [
      {
        ciudad: 'Arica', etapas: 2, hijos: [
          { ciudad: 'Algarrobo', etapas: 1 },
          { ciudad: 'Calama', etapas: 1 },
          { ciudad: 'Antofagasta', etapas: 1 }
        ]
      },
      {
        ciudad: 'Calama', etapas: 1, hijos: [
          { ciudad: 'Antofagasta', etapas: 1 },
          { ciudad: 'Algarrobo', etapas: 1 }
        ]
      },
      {
        ciudad: 'Antofagasta', etapas: 1, hijos: [
          { ciudad: 'Algarrobo', etapas: 1 }
        ]
      }
    ];
    
    // Filtrar ciudades principales omitidas
    const filteredTree = treeData.filter(nodo => !omitCities.includes(nodo.ciudad));
    
    organigram.innerHTML = `
      <div class="route-map-tree-main" style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;">
        <div class="card-body p-0" style="background:transparent;">
          <div class="stages-accordion-container accordion" id="routeMapAccordion">
            <div class="px-3 pt-3 pb-2 border-bottom" style="background:transparent;font-weight:600;font-size:15px;color:#222;">Mapa de ruta <span style="font-weight:400;font-size:13px;color:#666;">(4 Ciudades, 6 Tramo, 5 Etapas)</span></div>
            <div class="px-3 pt-2 pb-2" style="background:transparent;font-size:13px;color:#2563eb;cursor:pointer;user-select:none;" id="expandCollapseAllBtn">
              <span class="me-2"><i class="fas fa-caret-right"></i></span><span id="expandCollapseAllText">Expandir todos</span>
            </div>
            ${filteredTree.map((nodo, idx) => {
              // Filtrar hijos omitidos por ciudad y por par (tramo)
              const hijosFiltrados = nodo.hijos.filter(hijo => {
                if (omitCities.includes(hijo.ciudad)) return false;
                // Tramo: ciudad principal - hijo
                const par1 = `${nodo.ciudad}-${hijo.ciudad}`;
                const par2 = `${hijo.ciudad}-${nodo.ciudad}`;
                return !omitPairs.includes(par1) && !omitPairs.includes(par2);
              });
              if (hijosFiltrados.length === 0) return '';
              const headingId = `headingOrganigram${idx}`;
              return `
              <div class="accordion-item" style="background:transparent;border:none;">
                <h2 class="stages-accordion-header accordion-header" id="${headingId}">
                  <button type="button" aria-expanded="false" class="accordion-button collapsed justify-content-start" data-bs-toggle="collapse" data-bs-target="#collapse${idx}" aria-controls="collapse${idx}" style="background:#f9fafb;color:#222;font-size:13px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;">
                    <span class="w-30-px"><i class="fas fa-caret-right me-2" style="color:#888;"></i></span>
                    <span style="font-size:13px;">${nodo.ciudad}</span>
                  </button>
                </h2>
                <div id="collapse${idx}" class="accordion-collapse collapse" aria-labelledby="${headingId}">
                  <div class="pd-0 accordion-body" style="background:#fff;">
                    ${hijosFiltrados.map(hijo => `
                      <div class="list-item d-flex align-items-center" style="font-size:13px;">
                        <span class="me-2" style="color:#bbb;font-size:15px;">&#8226;</span>
                        <div class="pd-x-25 mg-l-15 flex-grow-1" style="font-size:13px;">${hijo.ciudad}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
    
    // Funcionalidad expandir/colapsar todos
    setTimeout(() => {
      const expandBtn = document.getElementById('expandCollapseAllBtn');
      const expandText = document.getElementById('expandCollapseAllText');
      let expanded = false;
      if (expandBtn) {
        expandBtn.onclick = () => {
          const acc = document.getElementById('routeMapAccordion');
          if (!acc) return;
          const collapses = acc.querySelectorAll('.accordion-collapse');
          collapses.forEach((el) => {
            const bsCollapse = bootstrap.Collapse.getOrCreateInstance(el, {toggle: false});
            if (!expanded) {
              bsCollapse.show();
            } else {
              bsCollapse.hide();
            }
          });
          expanded = !expanded;
          expandText.textContent = expanded ? 'Colapsar todos' : 'Expandir todos';
        };
      }
    }, 100);
  }
}

window.ChangeRouteHandler = ChangeRouteHandler;
window.changeRouteHandler = new ChangeRouteHandler(); 