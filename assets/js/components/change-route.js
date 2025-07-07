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
    
    // --- NUEVO: Lógica para rutas distintas y ciudades ejemplo ---
    // Definir ciudades por ruta
    const rutasCiudades = {
      'Autopista X Pardo': ['Arica', 'Calama', 'Antofagasta', 'Algarrobo'],
      'Ruta 2': ['Santiago', 'Rancagua', 'Talca', 'Chillán', 'Concepción'],
      'Ruta 3': ['Valparaíso', 'Viña del Mar', 'La Serena', 'Coquimbo'],
      'Ruta 4': ['Iquique', 'Pozo Almonte', 'Calama', 'Antofagasta']
    };
    // Utilidad para obtener ciudades de la ruta seleccionada
    function getCurrentRouteCities() {
      const rutaSel = document.getElementById('changeRouteRuta');
      return rutasCiudades[rutaSel?.value] || rutasCiudades['Autopista X Pardo'];
    }
    // Función para actualizar selects y secuencia según ruta y omisiones
    const updateCiudadesPorRuta = (ruta, omitidas = [], omitPairs = []) => {
      const allCities = rutasCiudades[ruta] || rutasCiudades['Autopista X Pardo'];
      // Obtener origen y destino actuales
      const originSel = document.getElementById('changeRouteOrigin');
      const destSel = document.getElementById('changeRouteDestination');
      const origen = originSel?.value || allCities[0];
      const destino = destSel?.value || allCities[allCities.length-1];
      const idxOrigen = allCities.indexOf(origen);
      const idxDestino = allCities.indexOf(destino);
      let secuenciaRango = [];
      if (idxOrigen !== -1 && idxDestino !== -1 && idxOrigen < idxDestino) {
        secuenciaRango = allCities.slice(idxOrigen, idxDestino + 1);
      } else if (idxOrigen !== -1 && idxDestino !== -1 && idxOrigen > idxDestino) {
        secuenciaRango = allCities.slice(idxDestino, idxOrigen + 1).reverse();
      }
      // Remover de omitidas cualquier ciudad fuera de la secuencia
      const omitidasFiltradas = omitidas.filter(c => secuenciaRango.includes(c));
      // Actualizar selects de omitidas
      const skipCitiesSel = document.getElementById('changeRouteSkipCities');
      if (skipCitiesSel) {
        skipCitiesSel.innerHTML = secuenciaRango.slice(1, -1).map(c => `<option value="${c}"${omitidasFiltradas.includes(c)?' selected':''}>${c}</option>`).join('');
      }
      // Actualizar pares de tramos
      const skipPairsSel = document.getElementById('changeRouteSkipPairs');
      let filtered = secuenciaRango.filter(c => !omitidasFiltradas.includes(c));
      if (skipPairsSel) {
        let pairs = [];
        for (let i = 0; i < filtered.length; i++) {
          for (let j = i + 1; j < filtered.length; j++) {
            pairs.push(`${filtered[i]}-${filtered[j]}`);
          }
        }
        const nuevos = (omitPairs || []).filter(par => pairs.includes(par));
        skipPairsSel.innerHTML = pairs.map(p => `<option value=\"${p}\"${nuevos.includes(p)?' selected':''}>${p.replace(/-/g, ' - ')}</option>`).join('');
        $(skipPairsSel).val(nuevos).trigger('change.select2');
      }
      // Actualizar secuencia de ciudades (solo depende de omitidas)
      filtered = secuenciaRango.filter(c => !omitidasFiltradas.includes(c));
      const seqSpan = document.getElementById('citySequenceSpan');
      if (seqSpan) {
        seqSpan.className = 'd-flex flex-row align-items-center flex-wrap gap-2';
        seqSpan.innerHTML = filtered.map((c, i) => `
          <span class='badge bg-secondary me-2 mb-1' style='font-size:13px;'>${c}</span>
          ${i < filtered.length-1 ? "<span class='fa fa-angle-double-right text-muted me-2'></span>" : ''}
        `).join('');
      }
      // Actualizar selects de origen/destino
      if (originSel && destSel) {
        const currentOrigin = originSel.value;
        const currentDest = destSel.value;
        // Mostrar SIEMPRE todas las ciudades de la ruta base
        const allCities = rutasCiudades[ruta] || rutasCiudades['Autopista X Pardo'];
        originSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
        destSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
        if (allCities.includes(currentOrigin)) {
          originSel.value = currentOrigin;
        } else {
          originSel.value = allCities[0];
        }
        if (allCities.includes(currentDest)) {
          destSel.value = currentDest;
        } else {
          destSel.value = allCities[allCities.length-1];
        }
      }
      // Actualizar organigrama
      setTimeout(() => {
        this.renderRouteOrganigram(serviceData, omitidasFiltradas, omitPairs, filtered);
      }, 100);
    };
    // Evento para cambio de ruta
    setTimeout(() => {
      const rutaSel = document.getElementById('changeRouteRuta');
      if (rutaSel) {
        rutaSel.addEventListener('change', (e) => {
          // Limpiar selects de omitir ciudades y tramos
          if (window.$ && window.$.fn && window.$.fn.select2) {
            $('#changeRouteSkipCities').val([]).trigger('change.select2');
            $('#changeRouteSkipPairs').val([]).trigger('change.select2');
          }
          // Al cambiar ruta, mostrar origen y destino de la ruta base
          const allCities = rutasCiudades[e.target.value] || rutasCiudades['Autopista X Pardo'];
          const originSel = document.getElementById('changeRouteOrigin');
          const destSel = document.getElementById('changeRouteDestination');
          if (originSel && destSel) {
            originSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
            destSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
            originSel.value = allCities[0];
            destSel.value = allCities[allCities.length-1];
          }
          updateCiudadesPorRuta(e.target.value, [], []);
        });
        // Inicializar según la ruta actual
        const allCities = rutasCiudades[rutaSel.value] || rutasCiudades['Autopista X Pardo'];
        const originSel = document.getElementById('changeRouteOrigin');
        const destSel = document.getElementById('changeRouteDestination');
        if (originSel && destSel) {
          originSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
          destSel.innerHTML = allCities.map(c => `<option value="${c}">${c}</option>`).join('');
          originSel.value = allCities[0];
          destSel.value = allCities[allCities.length-1];
        }
        updateCiudadesPorRuta(rutaSel.value);
      }
    }, 300);
    // --- FIN NUEVO ---
    
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
          // SIEMPRE usar el rango entre origen y destino seleccionados
          const originSel = document.getElementById('changeRouteOrigin');
          const destSel = document.getElementById('changeRouteDestination');
          const origen = originSel.value;
          const destino = destSel.value;
          // Buscar la ruta base solo para saber el orden
          const rutaSel = document.getElementById('changeRouteRuta');
          const allCities = rutasCiudades[rutaSel?.value] || rutasCiudades['Autopista X Pardo'];
          const idxOrigen = allCities.indexOf(origen);
          const idxDestino = allCities.indexOf(destino);
          let secuenciaRango = [];
          if (idxOrigen !== -1 && idxDestino !== -1 && idxOrigen < idxDestino) {
            secuenciaRango = allCities.slice(idxOrigen, idxDestino + 1);
          } else if (idxOrigen !== -1 && idxDestino !== -1 && idxOrigen > idxDestino) {
            secuenciaRango = allCities.slice(idxDestino, idxOrigen + 1).reverse();
          }
          // Remover de omitidas cualquier ciudad fuera de la secuencia
          const omitidasFiltradas = omitidas.filter(c => secuenciaRango.includes(c));
          // Actualizar selects de omitidas
          $('#changeRouteSkipCities').empty();
          secuenciaRango.slice(1, -1).forEach(ciudad => {
            if (omitidasFiltradas.includes(ciudad)) {
              $('#changeRouteSkipCities').append(`<option value="${ciudad}" selected>${ciudad}</option>`);
            } else {
              $('#changeRouteSkipCities').append(`<option value="${ciudad}">${ciudad}</option>`);
            }
          });
          setTimeout(() => {
            $('#changeRouteSkipCities').val(omitidasFiltradas).trigger('change.select2');
          }, 0);
          // Actualizar pares de tramos
          const ciudadesValidas = secuenciaRango.filter(c => !omitidasFiltradas.includes(c));
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
          const nuevos = paresSeleccionados.filter(par => pares.includes(par));
          paresSelect.val(nuevos).trigger('change.select2');
          // Actualizar secuencia de ciudades
          let filtered = secuenciaRango.filter(c => !omitidasFiltradas.includes(c));
          const seqSpan = document.getElementById('citySequenceSpan');
          if (seqSpan) {
            seqSpan.className = 'd-flex flex-row align-items-center flex-wrap gap-2';
            seqSpan.innerHTML = filtered.map((c, i) => `
              <span class='badge bg-secondary me-2 mb-1' style='font-size:13px;'>${c}</span>
              ${i < filtered.length-1 ? "<span class='fa fa-angle-double-right text-muted me-2'></span>" : ''}
            `).join('');
          }
          // Actualizar selects de origen/destino (mantener el valor seleccionado si es posible)
          if (originSel && destSel) {
            const currentOrigin = originSel.value;
            const currentDest = destSel.value;
            originSel.innerHTML = filtered.map(c => `<option value="${c}">${c}</option>`).join('');
            destSel.innerHTML = filtered.map(c => `<option value="${c}">${c}</option>`).join('');
            if (filtered.includes(currentOrigin)) {
              originSel.value = currentOrigin;
            } else if (filtered.length > 0) {
              originSel.value = filtered[0];
            }
            if (filtered.includes(currentDest)) {
              destSel.value = currentDest;
            } else if (filtered.length > 0) {
              destSel.value = filtered[filtered.length-1];
            }
          }
          // Actualizar organigrama
          setTimeout(() => {
            if (window.changeRouteHandler && typeof window.changeRouteHandler.renderRouteOrganigram === 'function') {
              window.changeRouteHandler.renderRouteOrganigram({}, omitidasFiltradas, nuevos, filtered);
            }
          }, 100);
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
          const rutaSel = document.getElementById('changeRouteRuta');
          updateCiudadesPorRuta(rutaSel.value, omitCities, omitPairs);
        };
        $('#changeRouteSkipCities').on('change', rerenderOrganigram);
        $('#changeRouteSkipPairs').on('change', rerenderOrganigram);
        // Log para depuración
        console.log('Eventos de cambio de omisión de ciudades y tramos configurados');
        // --- NUEVO: Actualizar todo al cambiar origen/destino ---
        $('#changeRouteOrigin, #changeRouteDestination').off('change').on('change', function() {
          // Al cambiar origen o destino, actualizar secuencia, omitidas, tramos y organigrama
          const rutaSel = document.getElementById('changeRouteRuta');
          const omitidas = $('#changeRouteSkipCities').val() || [];
          const omitPairs = $('#changeRouteSkipPairs').val() || [];
          updateCiudadesPorRuta(rutaSel.value, omitidas, omitPairs);
        });
        // --- FIN NUEVO ---
      }
    }, 200);
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('changeRouteModal'));
    modal.show();
    
    // Render organigrama inicial
    setTimeout(() => {
      const rutaSel = document.getElementById('changeRouteRuta');
      updateCiudadesPorRuta(rutaSel.value);
    }, 100);
    
    // Configurar eventos de tabs
    this.setupTabEvents();
    
    // Configurar botones
    this.setupButtons();

    // --- Opciones de rutas para el select ---
    setTimeout(() => {
      const rutas = ['Autopista X Pardo', 'Ruta 2', 'Ruta 3', 'Ruta 4'];
      const rutaSel = document.getElementById('changeRouteRuta');
      if (rutaSel) {
        rutaSel.innerHTML = rutas.map(r => `<option value="${r}"${serviceData.variante === r ? ' selected' : ''}>${r}</option>`).join('');
        if (!rutas.includes(serviceData.variante)) {
          rutaSel.value = rutas[0];
        }
      }
    }, 10);
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
            // Extraer los nombres de ciudad de los spans con la clase 'badge'
            let cities = [];
            citySequenceSpan.querySelectorAll('span.badge').forEach(span => {
              const name = span.textContent.trim();
              if (name) cities.push(name);
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
    html += `<div class="row mb-2">
      <div class="col-12 d-flex align-items-center justify-content-between">
        <h6 class="fw-normal mb-0" style="font-size:0.70rem;letter-spacing:0.2px;">Etapas de la Ruta</h6>
        <span class="badge bg-primary shadow-sm" style="font-size:0.70rem;padding:5px 8px;">Tiempo total: <b>${tiempoTotal} hrs</b></span>
      </div>
    </div>`;
    html += `<div class="row mb-2">
      <div class="col-12 d-flex flex-row-reverse align-items-start">
        <div class="ms-2 d-flex align-items-center" style="min-width:220px;">
          <label class="form-label text-uppercase text-muted mb-0 me-2" style="font-size:12px;letter-spacing:1px;">Embarque inicial</label>`;
    html += `<select id="embarqueH" class="form-select form-select-sm d-inline-block text-center me-1" style="width:48px;padding:2px 4px;">`;
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
    html += `</div>`;
    html += `</div>`;
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
                        <div class="row">
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="form-label">Ruta</label>
                              <select id="changeRouteRuta" class="form-select"></select>
                            </div>
                            <div class="mb-3">
                              <label class="form-label">Origen</label>
                              <select id="changeRouteOrigin" class="form-select"></select>
                            </div>
                            <div class="mb-3">
                              <label class="form-label">Destino</label>
                              <select id="changeRouteDestination" class="form-select"></select>
                            </div>
                            <div class="mb-3">
                              <label class="form-label">Ciudades omitidas</label>
                              <select id="changeRouteSkipCities" class="form-select" multiple></select>
                              <small class="text-muted">Puedes seleccionar varias ciudades</small>
                            </div>
                            <div class="mb-3">
                              <label class="form-label">Omitir tramos</label>
                              <select id="changeRouteSkipPairs" class="form-select" multiple></select>
                              <small class="text-muted">Puedes seleccionar varios pares de ciudades</small>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="mb-3">
                              <label class="form-label">Secuencia de ciudades</label>
                              <div id="citySequenceSpan" class="mb-2"></div>
                            </div>
                            <div class="mb-3">
                              <label class="form-label">Mapa de ruta</label>
                              <div id="routeOrganigramContainer"></div>
                            </div>
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

  renderRouteOrganigram(serviceData, omitCities = [], omitPairs = [], filteredCities = null) {
    const organigram = document.getElementById('routeOrganigramContainer');
    if (!organigram) return;
    // --- Persistencia de estado expandido ---
    let expandedState = {};
    const prevAccordion = document.getElementById('routeMapAccordion');
    if (prevAccordion) {
      prevAccordion.querySelectorAll('.accordion-collapse').forEach(acc => {
        if (acc.classList.contains('show')) {
          expandedState[acc.id] = true;
        }
      });
    }
    // Obtener la secuencia filtrada (solo ciudades válidas entre origen y destino, sin omitidas)
    const cities = filteredCities || getCurrentRouteCities().filter(c => !omitCities.includes(c));
    // Construir estructura de nodos: para cada ciudad, hijos = solo los destinos posteriores en la secuencia
    let treeData = cities.map((ciudad, idx) => {
      let hijos = [];
      for (let j = idx + 1; j < cities.length; j++) {
        const par1 = `${ciudad}-${cities[j]}`;
        const par2 = `${cities[j]}-${ciudad}`;
        if (!omitPairs.includes(par1) && !omitPairs.includes(par2)) {
          hijos.push({ ciudad: cities[j] });
        }
      }
      return { ciudad, hijos };
    });
    organigram.innerHTML = `
      <div class="route-map-tree-main" style="background:#fff;border-radius:10px;border:1px solid #e5e7eb;">
        <div class="card-body p-0" style="background:transparent;">
          <div class="stages-accordion-container accordion" id="routeMapAccordion">
            <div class="px-3 pt-3 pb-2 border-bottom" style="background:transparent;font-weight:600;font-size:15px;color:#222;">Mapa de ruta <span style="font-weight:400;font-size:13px;color:#666;">(${cities.length} Ciudades, ${cities.length-1} Tramos)</span></div>
            ${treeData.map((nodo, idx) => {
              if (nodo.hijos.length === 0) return '';
              const headingId = `headingOrganigram${idx}`;
              const collapseId = `collapse${idx}`;
              return `
              <div class="accordion-item" style="background:transparent;border:none;">
                <h2 class="stages-accordion-header accordion-header" id="${headingId}">
                  <button type="button" aria-expanded="false" class="accordion-button collapsed justify-content-start" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-controls="${collapseId}" style="background:#f9fafb;color:#222;font-size:13px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;">
                    <span class="w-30-px"><i class="fas fa-caret-right me-2" style="color:#888;"></i></span>
                    <span style="font-size:13px;">${nodo.ciudad}</span>
                  </button>
                </h2>
                <div id="${collapseId}" class="accordion-collapse collapse${expandedState[`collapse${idx}`] ? ' show' : ''}" aria-labelledby="${headingId}">
                  <div class="pd-0 accordion-body" style="background:#fff;">
                    ${nodo.hijos.map(hijo => `
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