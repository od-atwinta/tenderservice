(function(global){
  'use strict';

  var STORAGE_KEY = 'atvinta_reference_data_v1';
  var STATUS_RULES_KEY = 'atvinta_status_section_rules_v1';
  var STATUS_MIGRATION_KEY = 'atvinta_status_matrix_migrated_v1';
  var STATUS_RULES_CANONICAL_MIGRATION_KEY = 'atvinta_status_matrix_canonical_v2';
  var STATUS_RULES_STAGE_MIGRATION_KEY = 'atvinta_status_matrix_stage_v3';
  var REFERENCE_HIERARCHY_MIGRATION_KEY = 'atvinta_reference_hierarchy_v4';
  var PROCESS_SECTION_OPTIONS_MIGRATION_KEY = 'atvinta_process_section_options_v5';
  var STATUS_RULES_HIERARCHY_MIGRATION_KEY = 'atvinta_status_rules_hierarchy_v4';
  var TENDER_STORAGE_KEY = 'atvinta_tenders_v2';
  var CURRENT_USER_KEY = 'atvinta_current_user_v1';
  var USERS_KEY = 'atvinta_users_v1';
  var USERS_SEED_MIGRATION_KEY = 'atvinta_users_seeded_v1';
  var CHECKLIST_TERMS_KEY = 'atvinta_checklist_terms_v1';
  var EXPERIENCE_KEY = 'atvinta_experience_v1';
  var DEPARTMENT_COLORS_KEY = 'atvinta_department_colors_v1';
  // справочник доступов площадок (Настройки → Автоматизация) — независим от
  // списка площадок на странице "Платежи" (там тарифы/депозиты, здесь доступ)
  var ACCESS_DIRECTORY_KEY = 'atvinta_access_directory_v1';
  var SYSTEM_ROLES = ['Суперадмин','Админ','Наблюдатель','Менеджер','Руководитель отдела','Сотрудник отдела'];
  var SECTION_ORDER = ['Новые','Ожидают решения','В работе','Заявки','Архив'];
  // статусы-исходы отказа/проигрыша, ведущие в Архив (без "Выиграли" — это не отказ);
  // используется общей модалкой "Изменить статус", чтобы спросить причину так же,
  // как это уже делают формы решения на "Новые"/"Ожидают решения"
  var LOSS_STATUSES = ['Отклонено','Отменено','Без выбора победителя','Завершено без ответа','Не допущены'];
  var PROCESS_STAGES = ['Отбор','Изучение','Подготовка','Подача','Итог'];
  var DEFAULTS = {
    departments: ['Продвижение','Техническая поддержка','Разработка','Аналитика','Дизайн','Аутстафф'],
    rejectionReasons: ['Нейронка плохо определила','Прочее','Не наш стек','Не наш стек/профиль',
      'Не успеваем подготовиться','Не проходим по КТ','Жесткие условия','Малобюджетный',
      'Нереальные сроки','Отмена заказчиком','Закрытая от нас','Дубль'],
    participationDecisions: ['Участвуем','Отказ','На рассмотрении'],
    processSections: ['НДА','ПКО','Основной','Этап 2','Этап 3','Переторжка','RFI'],
    applicationStatuses: ['На рассмотрении','Оценка','Формирование заявки','Готово к подаче',
      'Подано','Допущены','Отклонено','Отменено','Без выбора победителя',
      'Завершено без ответа','Не допущены','Выиграли'],
    currencies: ['₽','USD'],
    vatRates: ['5%','10%','20%'],
    procurementTypes: ['Электронный аукцион','Запрос предложений','Запрос цен','Конкурс','RFI'],
    foundations: ['223-ФЗ','44-ФЗ','Коммерческие закупки','внутренний конкурс','не указано']
  };
  var DEFAULT_USERS = [
    {id:'u1', name:'Оксана Денисенко', login:'oksana.denisenko@atwinta.ru', roles:['Суперадмин'], directions:[], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u2', name:'Игорь Соколов', login:'igor.sokolov@atwinta.ru', roles:['Менеджер'], directions:[], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u3', name:'Алексей Морозов', login:'alexey.morozov@atwinta.ru', roles:['Сотрудник отдела'], directions:['Техническая поддержка'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u4', name:'Дарья Волкова', login:'darya.volkova@atwinta.ru', roles:['Сотрудник отдела'], directions:['Техническая поддержка'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u5', name:'Павел Орлов', login:'pavel.orlov@atwinta.ru', roles:['Сотрудник отдела'], directions:['Разработка'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u6', name:'Елена Соколова', login:'elena.sokolova@atwinta.ru', roles:['Сотрудник отдела'], directions:['Аналитика'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u7', name:'Никита Лебедев', login:'nikita.lebedev@atwinta.ru', roles:['Сотрудник отдела'], directions:['Дизайн'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u8', name:'Мария Кузнецова', login:'maria.kuznetsova@atwinta.ru', roles:['Сотрудник отдела'], directions:['Продвижение'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u9', name:'Илья Фёдоров', login:'ilya.fedorov@atwinta.ru', roles:['Сотрудник отдела'], directions:['Аутстафф'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u10', name:'Анна Смирнова', login:'anna.smirnova@atwinta.ru', roles:['Сотрудник отдела'], directions:['Аналитика'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u11', name:'Роман Васильев', login:'roman.vasilev@atwinta.ru', roles:['Сотрудник отдела'], directions:['Разработка'], status:'active', createdAt:'2026-01-12', mustChangePassword:false},
    {id:'u12', name:'Софья Попова', login:'sofya.popova@atwinta.ru', roles:['Сотрудник отдела'], directions:['Дизайн'], status:'active', createdAt:'2026-01-12', mustChangePassword:false}
  ];
  var DEFAULT_STATUS_RULES = {
    'На рассмотрении':{type:'key',sections:['Ожидают решения']},
    'Оценка':{type:'through',sections:['Новые','Ожидают решения','В работе','Заявки']},
    'Формирование заявки':{type:'key',sections:['В работе']},
    'Готово к подаче':{type:'key',sections:['В работе']},
    'Подано':{type:'key',sections:['Заявки']},
    'Допущены':{type:'through',sections:['Ожидают решения','В работе','Заявки']},
    'Отклонено':{type:'key',sections:['Архив']},
    'Отменено':{type:'key',sections:['Архив']},
    'Без выбора победителя':{type:'key',sections:['Архив']},
    'Завершено без ответа':{type:'key',sections:['Архив']},
    'Не допущены':{type:'key',sections:['Архив']},
    'Выиграли':{type:'key',sections:['Архив']}
  };
  var LEGACY_STATUS_MAP = {
    'Формируем':'Формирование заявки',
    'Подали':'Подано',
    'ПКО/НДА':'На рассмотрении',
    'Одобрена':'Допущены',
    'Второй этап':'Подано',
    'Переторжка':'Подано',
    'Не успели податься':'Завершено без ответа',
    'Контракт заключен':'Выиграли',
    'Б/выбора победителя':'Без выбора победителя',
    'Отказались сами':'Отклонено'
  };
  var LEGACY_SECTION_MAP = {
    'ПКО/НДА':'ПКО',
    'Второй этап':'Этап 2',
    'Переторжка':'Переторжка',
    'Контракт заключен':'Итог',
    'Б/выбора победителя':'Итог',
    'Отказались сами':'Итог',
    'Отменено':'Итог'
  };
  // справочник "Чек-лист" (Настройки → Автоматизация): соответствие ключевой фразы из
  // текста отчёта ИИ (поля "Требования к поставщику"/"Критерии оценки") пункту чек-листа
  var DEFAULT_CHECKLIST_TERMS = [
    {phrase:'лицензия', document:'Копия лицензии на вид деятельности'},
    {phrase:'ФСТЭК', document:'Копия лицензии ФСТЭК'},
    {phrase:'СМП', document:'Декларация о принадлежности к СМП'},
    {phrase:'малого предпринимательства', document:'Декларация о принадлежности к СМП'},
    {phrase:'опыт', document:'Документы, подтверждающие опыт аналогичных работ'},
    {phrase:'портфолио', document:'Портфолио выполненных проектов'},
    {phrase:'партнёр', document:'Сертификат/статус партнёра'},
    {phrase:'сертифицированны', document:'Документы о квалификации специалистов'},
    {phrase:'банковская гарантия', document:'Банковская гарантия обеспечения заявки'},
    {phrase:'обеспечение заявки', document:'Банковская гарантия обеспечения заявки'},
    {phrase:'страхование', document:'Полис страхования ответственности'},
    {phrase:'СРО', document:'Выписка из реестра СРО'},
    {phrase:'аккредитация', document:'Свидетельство об аккредитации'}
  ];
  // цвет плашки направления (Дизайн-система.md): 6 текущих значений не меняются;
  // остальные 12 — согласованный резерв пастельных тонов для новых направлений
  var DEFAULT_DEPARTMENT_COLORS = {
    'Продвижение':'#FCE4EC','Техническая поддержка':'#E3F2FD','Разработка':'#E8EAF6',
    'Аналитика':'#E8F5E9','Дизайн':'#F3E5F5','Аутстафф':'#FFF3E0'
  };
  var DEPARTMENT_NEUTRAL_COLOR = '#ECEFF1';
  var DEPARTMENT_COLOR_PALETTE = [
    '#FCE4EC','#E3F2FD','#E8EAF6','#E8F5E9','#F3E5F5','#FFF3E0',
    '#EDE7F6','#E1F5FE','#E0F7FA','#E0F2F1','#F1F8E9','#F9FBE7',
    '#FFFDE7','#FFF8E1','#FBE9E7','#EFEBE9','#FFEBEE','#E6F9F0'
  ];
  // "безопасные" текстовые справочники: переименование значения обновляет его
  // везде, где оно уже сохранено точным текстом (не трогает статусы/решения/
  // секции — на их названиях завязана логика переходов между разделами)
  var RENAME_TARGETS = {
    departments: [
      {storageKey:'atvinta_tenders_v2', fields:[{name:'depts',type:'array'},{name:'dept',type:'string'}]},
      {storageKey:'atvinta_users_v1', fields:[{name:'directions',type:'array'}]},
      {storageKey:'atvinta_experience_v1', fields:[{name:'directions',type:'array'}]}
    ],
    rejectionReasons: [
      {storageKey:'atvinta_tenders_v2', fields:[{name:'rejectReason',type:'string'}]}
    ],
    procurementTypes: [
      {storageKey:'atvinta_tenders_v2', fields:[{name:'procType',type:'string'}]}
    ],
    foundations: [
      {storageKey:'atvinta_tenders_v2', fields:[{name:'law',type:'string'}]}
    ],
    currencies: [
      {storageKey:'atvinta_tenders_v2', fields:[{name:'currencies',type:'array'}]}
    ]
  };
  // деактивация вместо удаления — только для "безопасных" справочников выше
  // (те же ключи, что у переименования): значение остаётся в data[key], но
  // TenderReferences.get() скрывает его из выпадающих списков по всему сервису;
  // полный список (включая деактивированные) виден только в редакторе Настроек
  var REFERENCE_INACTIVE_KEY = 'atvinta_reference_inactive_v1';
  function loadInactiveReferenceValues(){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem(REFERENCE_INACTIVE_KEY) || '{}'); }catch(error){}
    var result = {};
    Object.keys(RENAME_TARGETS).forEach(function(key){
      result[key] = Array.isArray(stored[key]) ? stored[key].slice() : [];
    });
    return result;
  }
  function saveInactiveReferenceValues(map){
    var clean = {};
    Object.keys(RENAME_TARGETS).forEach(function(key){
      clean[key] = Array.isArray(map && map[key]) ? map[key].filter(Boolean) : [];
    });
    localStorage.setItem(REFERENCE_INACTIVE_KEY, JSON.stringify(clean));
    return clean;
  }
  function isReferenceValueInactive(key, value){
    if(!RENAME_TARGETS[key]) return false;
    return loadInactiveReferenceValues()[key].indexOf(value) !== -1;
  }
  function activeReferenceValues(key){
    var all = load()[key] || [];
    if(!RENAME_TARGETS[key]) return all;
    var inactive = loadInactiveReferenceValues()[key];
    return all.filter(function(value){ return inactive.indexOf(value) === -1; });
  }

  function clone(value){
    return JSON.parse(JSON.stringify(value));
  }
  function optionPriority(value, text){
    var normalizedValue = String(value == null ? '' : value).trim().toLowerCase();
    var normalizedText = String(text == null ? value : text).trim().toLowerCase();
    if(!normalizedValue || normalizedValue === 'all' || normalizedText === 'все'
      || normalizedText === 'не указано' || normalizedText === '—') return 0;
    if(normalizedText.indexOf('добавить новое') !== -1) return 2;
    return 1;
  }
  function sortItems(items, valueOf, textOf){
    var prepared = items.map(function(item, index){
      return {
        item:item,
        index:index,
        value:valueOf(item),
        text:textOf(item)
      };
    });
    var regular = prepared.filter(function(entry){
      return optionPriority(entry.value, entry.text) === 1;
    });
    if(regular.length && regular.every(function(entry){
      return /^\d+(?:[.,]\d+)?$/.test(String(entry.text).trim());
    })) return items.slice();
    prepared.sort(function(a,b){
      var priorityA = optionPriority(a.value, a.text);
      var priorityB = optionPriority(b.value, b.text);
      if(priorityA !== priorityB) return priorityA - priorityB;
      if(priorityA !== 1) return a.index - b.index;
      var compared = String(a.text).localeCompare(String(b.text), 'ru', {
        sensitivity:'base',
        numeric:true
      });
      return compared || a.index - b.index;
    });
    return prepared.map(function(entry){ return entry.item; });
  }
  function sortOptions(values){
    return sortItems(
      Array.isArray(values) ? values : [],
      function(value){ return value; },
      function(value){ return value; }
    );
  }
  function sortSelect(select){
    if(!select || !select.options) return select;
    var selectedValue = select.value;
    var options = Array.prototype.slice.call(select.options);
    sortItems(
      options,
      function(option){ return option.value; },
      function(option){ return option.textContent; }
    ).forEach(function(option){ select.appendChild(option); });
    select.value = selectedValue;
    return select;
  }
  function load(){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }catch(error){}
    var result = {};
    Object.keys(DEFAULTS).forEach(function(key){
      result[key] = Array.isArray(stored[key]) ? stored[key].slice() : DEFAULTS[key].slice();
    });
    if(!localStorage.getItem(STATUS_MIGRATION_KEY)){
      DEFAULTS.applicationStatuses.forEach(function(status){
        if(result.applicationStatuses.indexOf(status) === -1) result.applicationStatuses.push(status);
      });
      localStorage.setItem(STATUS_MIGRATION_KEY, '1');
      if(Array.isArray(stored.applicationStatuses)){
        stored.applicationStatuses = result.applicationStatuses.slice();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      }
    }
    if(!localStorage.getItem(REFERENCE_HIERARCHY_MIGRATION_KEY)){
      result.applicationStatuses = DEFAULTS.applicationStatuses.slice();
      result.processSections = DEFAULTS.processSections.slice();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      localStorage.setItem(REFERENCE_HIERARCHY_MIGRATION_KEY, '1');
    }
    if(!localStorage.getItem(PROCESS_SECTION_OPTIONS_MIGRATION_KEY)){
      result.processSections = DEFAULTS.processSections.slice();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
      localStorage.setItem(PROCESS_SECTION_OPTIONS_MIGRATION_KEY, '1');
    }
    return result;
  }
  function save(data){
    var normalized = {};
    Object.keys(DEFAULTS).forEach(function(key){
      normalized[key] = Array.isArray(data[key])
        ? data[key].map(function(value){ return String(value).trim(); }).filter(Boolean)
        : DEFAULTS[key].slice();
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    return clone(normalized);
  }
  function fallbackStatusRule(status){
    var archiveStatuses = ['Отклонено','Отменено','Без выбора победителя',
      'Завершено без ответа','Не допущены','Выиграли'];
    return {
      type:'key',
      sections:[archiveStatuses.indexOf(status) !== -1 ? 'Архив' : 'Заявки']
    };
  }
  function normalizeStatusRule(status, rule){
    var fallback = DEFAULT_STATUS_RULES[status] || fallbackStatusRule(status);
    var source = rule || fallback;
    var type = source.type === 'through' ? 'through' : 'key';
    var sections = Array.isArray(source.sections)
      ? source.sections.filter(function(section){ return SECTION_ORDER.indexOf(section) !== -1; })
      : fallback.sections.slice();
    sections = sections.filter(function(section,index){ return sections.indexOf(section) === index; });
    if(type === 'key' && sections.length > 1) sections = sections.slice(0,1);
    return {type:type,sections:sections};
  }
  function loadStatusRules(){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem(STATUS_RULES_KEY) || '{}'); }catch(error){}
    if(!localStorage.getItem(STATUS_RULES_HIERARCHY_MIGRATION_KEY)){
      stored = clone(DEFAULT_STATUS_RULES);
      localStorage.setItem(STATUS_RULES_KEY, JSON.stringify(stored));
      localStorage.setItem(STATUS_RULES_HIERARCHY_MIGRATION_KEY, '1');
      localStorage.setItem(STATUS_RULES_CANONICAL_MIGRATION_KEY, '1');
      localStorage.setItem(STATUS_RULES_STAGE_MIGRATION_KEY, '1');
    }
    var result = {};
    load().applicationStatuses.forEach(function(status){
      result[status] = normalizeStatusRule(status, stored[status] || DEFAULT_STATUS_RULES[status]);
    });
    return result;
  }
  function saveStatusRules(rules, statuses){
    var normalized = {};
    (Array.isArray(statuses) ? statuses : load().applicationStatuses).forEach(function(status){
      normalized[status] = normalizeStatusRule(status, rules && rules[status]);
    });
    localStorage.setItem(STATUS_RULES_KEY, JSON.stringify(normalized));
    return clone(normalized);
  }
  function statusRule(status){
    return loadStatusRules()[status] || normalizeStatusRule(status, null);
  }
  function loadChecklistTerms(){
    var stored = [];
    try{ stored = JSON.parse(localStorage.getItem(CHECKLIST_TERMS_KEY) || '[]'); }catch(error){}
    if(!Array.isArray(stored) || !stored.length){
      stored = clone(DEFAULT_CHECKLIST_TERMS);
      localStorage.setItem(CHECKLIST_TERMS_KEY, JSON.stringify(stored));
    }
    return stored;
  }
  function saveChecklistTerms(terms){
    var clean = (Array.isArray(terms) ? terms : []).map(function(item){
      return {phrase:String((item && item.phrase) || '').trim(), document:String((item && item.document) || '').trim()};
    }).filter(function(item){ return item.phrase && item.document; });
    localStorage.setItem(CHECKLIST_TERMS_KEY, JSON.stringify(clean));
    return clean;
  }
  function loadDepartmentColors(){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem(DEPARTMENT_COLORS_KEY) || '{}'); }catch(error){}
    if(!stored || typeof stored !== 'object') stored = {};
    var result = clone(DEFAULT_DEPARTMENT_COLORS);
    Object.keys(stored).forEach(function(name){
      if(typeof stored[name] === 'string' && /^#[0-9a-fA-F]{6}$/.test(stored[name])) result[name] = stored[name];
    });
    return result;
  }
  function saveDepartmentColors(map){
    var clean = {};
    Object.keys(map || {}).forEach(function(name){
      var key = String(name).trim();
      var value = map[name];
      if(key && typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)) clean[key] = value;
    });
    localStorage.setItem(DEPARTMENT_COLORS_KEY, JSON.stringify(clean));
    return clean;
  }
  function departmentColor(name){
    var colors = loadDepartmentColors();
    return colors[name] || DEPARTMENT_NEUTRAL_COLOR;
  }
  function loadAccessDirectory(){
    var stored = [];
    try{ stored = JSON.parse(localStorage.getItem(ACCESS_DIRECTORY_KEY) || '[]'); }catch(error){}
    return Array.isArray(stored) ? stored : [];
  }
  function saveAccessDirectory(list){
    var clean = (Array.isArray(list) ? list : []).map(function(item){
      return {
        id:item.id,
        name:String(item.name || '').trim(),
        link:String(item.link || '').trim(),
        accessType:item.accessType || 'Смешанный',
        login:item.accessType === 'Логин' ? String(item.login || '').trim() : '',
        password:item.accessType === 'Логин' ? String(item.password || '') : ''
      };
    }).filter(function(item){ return item.name; });
    localStorage.setItem(ACCESS_DIRECTORY_KEY, JSON.stringify(clean));
    return clean;
  }
  // считает, сколько сохранённых записей используют старое значение справочника —
  // показывается Оксане в подтверждении перед массовым переименованием
  function countRenameUsage(refKey, oldValue){
    var targets = RENAME_TARGETS[refKey];
    if(!targets || !oldValue) return 0;
    var total = 0;
    targets.forEach(function(target){
      var list = [];
      try{ list = JSON.parse(localStorage.getItem(target.storageKey) || '[]'); }catch(error){ list = []; }
      if(!Array.isArray(list)) return;
      list.forEach(function(record){
        if(!record || typeof record !== 'object') return;
        var matched = target.fields.some(function(field){
          var value = record[field.name];
          return field.type === 'array'
            ? Array.isArray(value) && value.indexOf(oldValue) !== -1
            : value === oldValue;
        });
        if(matched) total++;
      });
    });
    return total;
  }
  // переименовывает значение справочника во всех сохранённых записях, где оно
  // встречается точным текстом (см. RENAME_TARGETS); возвращает число задетых записей
  function applyReferenceRename(refKey, oldValue, newValue){
    var targets = RENAME_TARGETS[refKey];
    if(!targets || !oldValue || !newValue || oldValue === newValue) return 0;
    var touched = 0;
    targets.forEach(function(target){
      var list = [];
      try{ list = JSON.parse(localStorage.getItem(target.storageKey) || '[]'); }catch(error){ list = []; }
      if(!Array.isArray(list) || !list.length) return;
      var changed = false;
      list.forEach(function(record){
        if(!record || typeof record !== 'object') return;
        var recordChanged = false;
        target.fields.forEach(function(field){
          var value = record[field.name];
          if(field.type === 'array' && Array.isArray(value)){
            var idx = value.indexOf(oldValue);
            if(idx !== -1){ value[idx] = newValue; recordChanged = true; }
          }else if(field.type === 'string' && value === oldValue){
            record[field.name] = newValue; recordChanged = true;
          }
        });
        if(recordChanged){ touched++; changed = true; }
      });
      if(changed) localStorage.setItem(target.storageKey, JSON.stringify(list));
    });
    return touched;
  }
  function displaySection(section){
    return section === 'Новый' ? 'Новые' : section;
  }
  function internalSection(section){
    return section === 'Новые' ? 'Новый' : section;
  }
  function baseSection(tender){
    if(tender && tender.decision === 'Отказ') return 'Архив';
    if(!tender || !tender.decision) return 'Новый';
    if(tender.decision === 'На рассмотрении') return 'Ожидают решения';
    return 'В работе';
  }
  function stageFromLifecycle(section){
    return {
      'Новый':'Отбор',
      'Новые':'Отбор',
      'Ожидают решения':'Изучение',
      'В работе':'Подготовка',
      'Заявки':'Подача',
      'Архив':'Итог'
    }[section] || 'Отбор';
  }
  function stageForStatus(status, fallback){
    if(status === 'На рассмотрении') return 'Изучение';
    if(status === 'Формирование заявки' || status === 'Готово к подаче') return 'Подготовка';
    if(status === 'Подано' || status === 'Допущены') return 'Подача';
    if(['Отклонено','Отменено','Без выбора победителя','Завершено без ответа',
      'Не допущены','Выиграли'].indexOf(status) !== -1) return 'Итог';
    return fallback || 'Отбор';
  }
  function inferredStatus(tender){
    if(tender && tender.appStatus) return LEGACY_STATUS_MAP[tender.appStatus] || tender.appStatus;
    if(tender && tender.decision === 'На рассмотрении') return 'На рассмотрении';
    if(tender && tender.decision === 'Участвуем') return 'Формирование заявки';
    if(tender && tender.decision === 'Отказ') return 'Отклонено';
    return '';
  }
  function normalizeApplication(application, tender, sectionIndex, applicationIndex){
    var source = application && typeof application === 'object' ? application : {};
    return {
      id:source.id || ('application-'+String(tender.id || 'new')+'-'+(sectionIndex+1)+'-'+(applicationIndex+1)),
      name:source.name || ('Заявка '+(applicationIndex+1)),
      deadline:source.deadline || tender.deadline || '',
      readiness:Math.max(0, Math.min(100, Number(source.readiness) || 0)),
      documentRefs:Array.isArray(source.documentRefs) ? source.documentRefs.slice() : []
    };
  }
  function sectionSnapshot(section){
    var snapshot = clone(section);
    delete snapshot.snapshot;
    snapshot.completed = true;
    snapshot.completedAt = snapshot.completedAt || new Date().toISOString();
    return snapshot;
  }
  function ensureTenderStructure(tender){
    if(!tender || typeof tender !== 'object') return tender;
    var legacyStatus = tender.appStatus || '';
    var status = inferredStatus(tender);
    if(status !== legacyStatus) tender.appStatus = status || null;
    if(legacyStatus === 'ПКО/НДА'){
      tender.decision = 'На рассмотрении';
      tender.lifecycleSection = 'Ожидают решения';
    }else if(['Формируем'].indexOf(legacyStatus) !== -1){
      tender.decision = 'Участвуем';
      tender.lifecycleSection = 'В работе';
    }else if(['Подали','Одобрена','Второй этап','Переторжка'].indexOf(legacyStatus) !== -1){
      tender.decision = 'Участвуем';
      tender.lifecycleSection = 'Заявки';
    }else if(['Не успели податься','Контракт заключен','Б/выбора победителя',
      'Отказались сами','Отменено'].indexOf(legacyStatus) !== -1){
      tender.decision = legacyStatus === 'Отменено' ? tender.decision : 'Отказ';
      tender.lifecycleSection = 'Архив';
    }
    var existing = Array.isArray(tender.tenderSections) ? tender.tenderSections : [];
    if(!existing.length){
      existing = [{
        id:'section-'+String(tender.id || 'new')+'-1',
        name:LEGACY_SECTION_MAP[legacyStatus] || 'Основной',
        stage:stageForStatus(status, stageFromLifecycle(tender.lifecycleSection || baseSection(tender))),
        status:status,
        deadline:tender.deadline || '',
        applications:[],
        documentRefs:[],
        documentIds:[],
        submissionDocumentIds:[],
        completed:false
      }];
    }
    tender.tenderSections = existing.map(function(section,index){
      var normalized = section && typeof section === 'object' ? section : {};
      var sectionStatus = LEGACY_STATUS_MAP[normalized.status] || normalized.status
        || (index === existing.length - 1 ? status : '');
      var applications = Array.isArray(normalized.applications) && normalized.applications.length
        ? normalized.applications
        : [{}];
      var result = {
        id:normalized.id || ('section-'+String(tender.id || 'new')+'-'+(index+1)),
        name:normalized.name || (index === 0 ? 'Основной' : ''),
        stage:PROCESS_STAGES.indexOf(normalized.stage) !== -1
          ? normalized.stage
          : stageForStatus(sectionStatus, stageFromLifecycle(tender.lifecycleSection || baseSection(tender))),
        status:sectionStatus || '',
        deadline:normalized.deadline || tender.deadline || '',
        description:normalized.description || '',
        amountExclVat:normalized.amountExclVat || '',
        vatRate:normalized.vatRate || '5%',
        amountInclVat:normalized.amountInclVat || '',
        applications:applications.map(function(application,applicationIndex){
          return normalizeApplication(application,tender,index,applicationIndex);
        }),
        documentRefs:Array.isArray(normalized.documentRefs) ? normalized.documentRefs.slice() : [],
        documentIds:Array.isArray(normalized.documentIds) ? normalized.documentIds.slice() : [],
        formsDocumentIds:Array.isArray(normalized.formsDocumentIds)
          ? normalized.formsDocumentIds.slice()
          : [],
        submissionDocumentIds:Array.isArray(normalized.submissionDocumentIds)
          ? normalized.submissionDocumentIds.slice()
          : [],
        completed:!!normalized.completed,
        completedAt:normalized.completedAt || ''
      };
      if(['Отклонено','Отменено','Без выбора победителя','Завершено без ответа',
        'Не допущены','Выиграли'].indexOf(result.status) !== -1){
        result.completed = true;
        result.completedAt = result.completedAt || new Date().toISOString();
      }
      if(result.completed) result.snapshot = normalized.snapshot || sectionSnapshot(result);
      return result;
    });
    tender.multiStage = !!tender.multiStage;
    var active = activeTenderSection(tender);
    if(active){
      active.status = tender.appStatus || active.status || '';
      active.stage = stageForStatus(active.status, active.stage);
      tender.appStatus = active.status || null;
    }
    return tender;
  }
  function activeTenderSection(tender){
    var sections = tender && Array.isArray(tender.tenderSections) ? tender.tenderSections : [];
    for(var index=sections.length-1;index>=0;index--){
      if(!sections[index].completed) return sections[index];
    }
    return sections[sections.length-1] || null;
  }
  function updateActiveSectionFromStatus(tender,status){
    ensureTenderStructure(tender);
    var active = activeTenderSection(tender);
    if(!active) return null;
    active.status = status || '';
    active.stage = stageForStatus(status, active.stage);
    tender.appStatus = status || null;
    if(['Отклонено','Отменено','Без выбора победителя','Завершено без ответа',
      'Не допущены','Выиграли'].indexOf(status) !== -1){
      active.completed = true;
      active.completedAt = new Date().toISOString();
      active.snapshot = sectionSnapshot(active);
      tender.archivedAt = tender.archivedAt || new Date().toISOString().slice(0,10);
    }
    return active;
  }
  function canAddTenderSection(tender){
    ensureTenderStructure(tender);
    var active = activeTenderSection(tender);
    return !!(tender.multiStage && active && !active.completed && active.status === 'Допущены'
      && active.name !== 'Итог');
  }
  function addTenderSection(tender,name){
    if(!canAddTenderSection(tender)) return null;
    var previous = activeTenderSection(tender);
    previous.completed = true;
    previous.completedAt = new Date().toISOString();
    previous.snapshot = sectionSnapshot(previous);
    var nextIndex = tender.tenderSections.length;
    var next = {
      id:'section-'+String(tender.id || 'new')+'-'+(nextIndex+1),
      name:name || '',
      stage:'Подготовка',
      status:'Формирование заявки',
      deadline:tender.deadline || '',
      applications:[normalizeApplication({},tender,nextIndex,0)],
      documentRefs:[],
      documentIds:[],
      formsDocumentIds:[],
      submissionDocumentIds:[],
      completed:false,
      completedAt:''
    };
    tender.tenderSections.push(next);
    tender.appStatus = next.status;
    tender.decision = 'Участвуем';
    tender.lifecycleSection = 'В работе';
    return next;
  }
  function syncTenderHierarchy(){
    var tenders = [];
    try{ tenders = JSON.parse(localStorage.getItem(TENDER_STORAGE_KEY) || '[]'); }catch(error){}
    if(!Array.isArray(tenders) || !tenders.length) return;
    var before = JSON.stringify(tenders);
    tenders.forEach(ensureTenderStructure);
    if(JSON.stringify(tenders) !== before){
      localStorage.setItem(TENDER_STORAGE_KEY, JSON.stringify(tenders));
    }
  }
  function resolveSection(tender, fallbackSection){
    if(tender && tender.decision === 'Отказ') return 'Архив';
    if(tender && tender.appStatus){
      var rule = statusRule(tender.appStatus);
      if(rule.type === 'through'){
        var remembered = tender.lifecycleSection
          || fallbackSection
          || baseSection(tender);
        remembered = displaySection(remembered);
        return SECTION_ORDER.indexOf(remembered) !== -1 ? internalSection(remembered) : baseSection(tender);
      }
      if(rule.sections[0]) return internalSection(rule.sections[0]);
    }
    return baseSection(tender);
  }
  function loadUsers(){
    var stored = [];
    try{ stored = JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }catch(error){}
    if(!localStorage.getItem(USERS_SEED_MIGRATION_KEY) || !Array.isArray(stored) || !stored.length){
      stored = clone(DEFAULT_USERS);
      localStorage.setItem(USERS_KEY, JSON.stringify(stored));
      localStorage.setItem(USERS_SEED_MIGRATION_KEY, '1');
    }
    return Array.isArray(stored) ? stored : clone(DEFAULT_USERS);
  }
  function saveUsers(list){
    localStorage.setItem(USERS_KEY, JSON.stringify(list));
    return clone(list);
  }
  function activeUsers(){
    return loadUsers().filter(function(u){ return u.status !== 'inactive'; });
  }
  function managerNames(){
    return sortOptions(activeUsers().filter(function(u){
      return (u.roles || []).some(function(role){
        return role === 'Менеджер' || role === 'Админ' || role === 'Суперадмин';
      });
    }).map(function(u){ return u.name; }));
  }
  function participantDirectory(){
    var list = [];
    activeUsers().forEach(function(u){
      var directions = Array.isArray(u.directions) && u.directions.length ? u.directions : [''];
      directions.forEach(function(dept){
        if(dept) list.push({name:u.name, dept:dept});
      });
    });
    return list;
  }
  function currentUser(){
    var user = null;
    try{ user = JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); }catch(error){}
    return user && user.name ? user : {name:'Оксана Денисенко',roles:['Суперадмин']};
  }
  // считает пункты чек-листа и задачи текущего пользователя со сроком "сегодня" —
  // используется для живого счётчика у пункта меню "Календарь"
  function myTodayTaskCount(){
    var tenders = [];
    try{ tenders = JSON.parse(localStorage.getItem(TENDER_STORAGE_KEY) || '[]'); }catch(error){}
    var me = currentUser();
    var today = new Date();
    var todayStr = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
    var count = 0;
    tenders.forEach(function(tender){
      ensureTenderStructure(tender);
      (Array.isArray(tender.checklist) ? tender.checklist : []).forEach(function(item){
        if(item.assignee === me.name && !item.done && String(item.due).slice(0,10) === todayStr) count++;
      });
      (Array.isArray(tender.tasks) ? tender.tasks : []).forEach(function(item){
        if(item.assignee === me.name && !item.done && String(item.due).slice(0,10) === todayStr) count++;
      });
    });
    return count;
  }
  function isAdminUser(user){
    var roles = user && Array.isArray(user.roles) ? user.roles : [];
    return roles.some(function(role){
      var value = String(role).toLocaleLowerCase('ru-RU');
      return value === 'админ' || value === 'администратор'
        || value === 'суперадмин' || value === 'суперадминистратор';
    });
  }
  function isObserverUser(user){
    var roles = user && Array.isArray(user.roles) ? user.roles : [];
    return roles.some(function(role){
      return String(role).toLocaleLowerCase('ru-RU') === 'наблюдатель';
    });
  }
  function isSuperadminUser(user){
    var roles = user && Array.isArray(user.roles) ? user.roles : [];
    return roles.some(function(role){
      var value = String(role).toLocaleLowerCase('ru-RU');
      return value === 'суперадмин' || value === 'суперадминистратор';
    });
  }
  // читает матрицу "Роли и доступы" (Настройки), настраиваемую только Суперадмином —
  // см. hasPermission ниже и подраздел "Роли и доступы" в Настройках
  var ACCESS_KEY = 'atvinta_role_access_v1';
  var ROLE_MATRIX_KEYS = {
    'суперадмин':'superadmin', 'суперадминистратор':'superadmin',
    'админ':'admin', 'администратор':'admin',
    'наблюдатель':'observer',
    'менеджер':'manager',
    'руководитель отдела':'head',
    'сотрудник отдела':'employee'
  };
  // проверяет конкретное настраиваемое право (ключ строки матрицы "Роли и доступы").
  // Если Суперадмин явно выставил "разрешено"/"запрещено" для роли пользователя —
  // используется это значение; иначе — значение по умолчанию из defaultAllowRoles
  // (массив ключей ролей матрицы, например ['superadmin','admin']).
  function hasPermission(permissionKey, user, defaultAllowRoles){
    var stored = {};
    try{ stored = JSON.parse(localStorage.getItem(ACCESS_KEY) || '{}'); }catch(error){}
    var roles = user && Array.isArray(user.roles) ? user.roles : [];
    var cell = stored[permissionKey] || {};
    return roles.some(function(role){
      var matrixKey = ROLE_MATRIX_KEYS[String(role).toLocaleLowerCase('ru-RU')];
      if(!matrixKey) return false;
      var state = cell[matrixKey];
      if(state === 'allow') return true;
      if(state === 'deny') return false;
      return (defaultAllowRoles || []).indexOf(matrixKey) !== -1;
    });
  }
  function availableStatuses(section, user, statuses){
    var values = Array.isArray(statuses) ? statuses : load().applicationStatuses;
    if(isAdminUser(user || currentUser())) return sortOptions(values);
    section = displaySection(section);
    var currentIndex = SECTION_ORDER.indexOf(section);
    var nextSection = currentIndex >= 0 ? SECTION_ORDER[currentIndex + 1] : '';
    return sortOptions(values.filter(function(status){
      var rule = statusRule(status);
      if(rule.type === 'through') return rule.sections.indexOf(section) !== -1;
      return rule.sections[0] === section || rule.sections[0] === nextSection;
    }));
  }
  function statusDestination(status, currentSection){
    var rule = statusRule(status);
    currentSection = displaySection(currentSection);
    return rule.type === 'through' ? currentSection : (rule.sections[0] || currentSection);
  }
  // скрывает пункты меню: data-admin-only — для всех кроме Админа/Суперадмина;
  // data-admin-observer-only — для всех кроме Админа/Суперадмина/Наблюдателя
  function applyAdminOnlyNav(){
    if(typeof document === 'undefined') return;
    var user = currentUser();
    var admin = isAdminUser(user);
    if(!admin) document.querySelectorAll('[data-admin-only]').forEach(function(el){ el.remove(); });
    if(!admin && !isObserverUser(user)){
      document.querySelectorAll('[data-admin-observer-only]').forEach(function(el){ el.remove(); });
    }
  }

  syncTenderHierarchy();

  // ---- подтверждение выхода с несохранёнными изменениями ----
  // каждая открытая форма помечает себя по ключу (setDirty/isDirty); при попытке
  // закрыть её через "Отмена"/клик по фону — guardedClose показывает диалог, если
  // есть несохранённое; при попытке уйти со страницы/закрыть вкладку, пока хотя бы
  // одна форма помечена как "грязная" — браузерное окно подтверждения (beforeunload)
  var dirtyFlags = {};
  function setDirty(key, value){ dirtyFlags[key] = !!value; }
  function isDirty(key){ return !!dirtyFlags[key]; }
  function anyDirty(){
    for(var k in dirtyFlags){ if(dirtyFlags[k]) return true; }
    return false;
  }
  if(typeof window !== 'undefined'){
    window.addEventListener('beforeunload', function(e){
      if(anyDirty()){ e.preventDefault(); e.returnValue = ''; return ''; }
    });
  }
  function guardedClose(key, discardFn, saveFn){
    if(isDirty(key)){
      confirmUnsavedExit(function(action){
        if(action === 'save' && saveFn) saveFn(); else discardFn();
      });
    } else {
      discardFn();
    }
  }

  // общее диалоговое окно "Сохранить / Не надо", переиспользует стили .overlay/.modal
  // уже подключённые на страницах, где есть свои модалки
  var unsavedGuardOverlay = null;
  function unsavedGuardModal(){
    if(unsavedGuardOverlay) return unsavedGuardOverlay;
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.id = 'unsavedGuardOverlay';
    overlay.style.zIndex = '60';
    overlay.innerHTML = '<div class="modal" style="max-width:360px;">'
      + '<h4>Сохранить изменения перед выходом?</h4>'
      + '<p class="hint" style="margin:8px 0 0;font-size:13px;color:var(--ink-muted);">Введённые данные ещё не сохранены.</p>'
      + '<div class="modal-actions">'
      + '<button type="button" class="btn" data-guard="discard">Не надо</button>'
      + '<button type="button" class="btn btn-primary" data-guard="save">Сохранить</button>'
      + '</div></div>';
    document.body.appendChild(overlay);
    unsavedGuardOverlay = overlay;
    return overlay;
  }
  // callback('save' | 'discard')
  function confirmUnsavedExit(callback){
    var overlay = unsavedGuardModal();
    overlay.classList.add('is-open');
    function onClick(e){
      var btn = e.target.closest('[data-guard]');
      if(!btn) return;
      overlay.classList.remove('is-open');
      overlay.removeEventListener('click', onClick);
      callback(btn.dataset.guard);
    }
    overlay.addEventListener('click', onClick);
  }

  global.TenderReferences = {
    key: STORAGE_KEY,
    confirmUnsavedExit: confirmUnsavedExit,
    setDirty: setDirty,
    isDirty: isDirty,
    guardedClose: guardedClose,
    statusRulesKey: STATUS_RULES_KEY,
    defaults: clone(DEFAULTS),
    defaultStatusRules: clone(DEFAULT_STATUS_RULES),
    sections: SECTION_ORDER.slice(),
    lossStatuses: LOSS_STATUSES.slice(),
    processStages: PROCESS_STAGES.slice(),
    getAll: load,
    get: activeReferenceValues,
    inactiveReferenceKeys: Object.keys(RENAME_TARGETS),
    isReferenceValueInactive: isReferenceValueInactive,
    getInactiveReferenceValues: loadInactiveReferenceValues,
    saveInactiveReferenceValues: saveInactiveReferenceValues,
    getStatusRules: loadStatusRules,
    getStatusRule: statusRule,
    saveStatusRules: saveStatusRules,
    checklistTermsKey: CHECKLIST_TERMS_KEY,
    getChecklistTerms: loadChecklistTerms,
    saveChecklistTerms: saveChecklistTerms,
    departmentColorsKey: DEPARTMENT_COLORS_KEY,
    departmentColorPalette: DEPARTMENT_COLOR_PALETTE.slice(),
    departmentNeutralColor: DEPARTMENT_NEUTRAL_COLOR,
    getDepartmentColors: loadDepartmentColors,
    saveDepartmentColors: saveDepartmentColors,
    departmentColor: departmentColor,
    accessDirectoryKey: ACCESS_DIRECTORY_KEY,
    getAccessDirectory: loadAccessDirectory,
    saveAccessDirectory: saveAccessDirectory,
    renameTargetKeys: Object.keys(RENAME_TARGETS),
    countRenameUsage: countRenameUsage,
    applyReferenceRename: applyReferenceRename,
    resolveSection: resolveSection,
    availableStatuses: availableStatuses,
    statusDestination: statusDestination,
    stageForStatus: stageForStatus,
    ensureTenderStructure: ensureTenderStructure,
    activeTenderSection: activeTenderSection,
    updateActiveSectionFromStatus: updateActiveSectionFromStatus,
    canAddTenderSection: canAddTenderSection,
    addTenderSection: addTenderSection,
    displaySection: displaySection,
    currentUser: currentUser,
    myTodayTaskCount: myTodayTaskCount,
    isAdminUser: isAdminUser,
    isObserverUser: isObserverUser,
    isSuperadminUser: isSuperadminUser,
    hasPermission: hasPermission,
    applyAdminOnlyNav: applyAdminOnlyNav,
    usersKey: USERS_KEY,
    systemRoles: SYSTEM_ROLES.slice(),
    getUsers: loadUsers,
    saveUsers: saveUsers,
    activeUsers: activeUsers,
    managerNames: managerNames,
    participantDirectory: participantDirectory,
    sortOptions: sortOptions,
    sortSelect: sortSelect,
    save: save
  };
})(window);
