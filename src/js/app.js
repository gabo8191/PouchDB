/* eslint-disable no-console */

// INVESTIGACION PUNTO 3:
// Este proyecto replica la estructura base de una PWA de clase
// (index, manifest, sw y app.js) y agrega las pruebas de PouchDB.

const DB_NAME = 'heroes';
let db = null;

const elements = {
  createDbButton: null,
  resetDbButton: null,
  listAllButton: null,
  createPrimaryButton: null,
  addAutoDocumentButton: null,
  addAutoJsonButton: null,
  attachBlobButton: null,
  editDocumentButton: null,
  editJsonButton: null,
  deleteDocumentButton: null,
  deleteJsonButton: null,
  primaryId: null,
  heroName: null,
  heroPower: null,
  heroTeam: null,
  blobDocId: null,
  blobFile: null,
  editId: null,
  editPower: null,
  deleteId: null,
  tableOutput: null,
};

function getRequiredElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`No se encontro el elemento con id ${id}`);
  }
  return element;
}

function setupDomReferences() {
  elements.createDbButton = getRequiredElement('btn-create-db');
  elements.resetDbButton = getRequiredElement('btn-reset-db');
  elements.listAllButton = getRequiredElement('btn-list-all');
  elements.createPrimaryButton = getRequiredElement('btn-create-primary');
  elements.addAutoDocumentButton = getRequiredElement('btn-add-auto-document');
  elements.addAutoJsonButton = getRequiredElement('btn-add-auto-json');
  elements.attachBlobButton = getRequiredElement('btn-attach-blob');
  elements.editDocumentButton = getRequiredElement('btn-edit-document');
  elements.editJsonButton = getRequiredElement('btn-edit-json');
  elements.deleteDocumentButton = getRequiredElement('btn-delete-document');
  elements.deleteJsonButton = getRequiredElement('btn-delete-json');

  elements.primaryId = getRequiredElement('primary-id');
  elements.heroName = getRequiredElement('hero-name');
  elements.heroPower = getRequiredElement('hero-power');
  elements.heroTeam = getRequiredElement('hero-team');
  elements.blobDocId = getRequiredElement('blob-doc-id');
  elements.blobFile = getRequiredElement('blob-file');
  elements.editId = getRequiredElement('edit-id');
  elements.editPower = getRequiredElement('edit-power');
  elements.deleteId = getRequiredElement('delete-id');
  elements.tableOutput = getRequiredElement('table-output');
}

function appendLog(level, message, details) {
  const prefix = `[PouchDB] ${message}`;

  if (level === 'error') {
    console.error(prefix, details || {});
    return;
  }

  if (level === 'info') {
    console.info(prefix, details || {});
    return;
  }

  console.log(prefix, details || {});
}

// INVESTIGACION PUNTO 11:
// Wrapper estandar para manejo de errores en todas las operaciones de PouchDB.
async function executeOperation(label, operation) {
  try {
    const result = await operation();
    appendLog('ok', label, result);
    return result;
  } catch (error) {
    appendLog('error', label, {
      message: error.message,
      name: error.name,
      status: error.status || null,
      reason: error.reason || null,
    });
    return null;
  }
}

function ensurePouchDBLoaded() {
  if (typeof window.PouchDB === 'undefined') {
    throw new Error('La libreria PouchDB no fue cargada desde el CDN.');
  }
}

function getDb() {
  ensurePouchDBLoaded();
  if (!db) {
    db = new window.PouchDB(DB_NAME);
  }
  return db;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderDocumentsTable(documents) {
  if (!documents.length) {
    elements.tableOutput.innerHTML =
      '<p>No hay registros en la base de datos.</p>';
    return;
  }

  const rows = documents
    .map((doc) => {
      const attachmentsCount = doc._attachments
        ? Object.keys(doc._attachments).length
        : 0;

      return `
        <tr>
          <td>${escapeHtml(doc._id)}</td>
          <td>${escapeHtml(doc.type || '')}</td>
          <td>${escapeHtml(doc.name || '')}</td>
          <td>${escapeHtml(doc.power || '')}</td>
          <td>${escapeHtml(doc.team || '')}</td>
          <td>${attachmentsCount}</td>
        </tr>
      `;
    })
    .join('');

  elements.tableOutput.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Tipo</th>
          <th>Nombre</th>
          <th>Poder</th>
          <th>Equipo</th>
          <th>Adjuntos</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function getInputValue(element, fallback = '') {
  const value = element.value.trim();
  return value || fallback;
}

function buildPrimaryHeroFromInputs() {
  return {
    _id: getInputValue(elements.primaryId, `hero_${Date.now()}`),
    type: 'hero',
    name: getInputValue(elements.heroName, 'Hero sin nombre'),
    power: getInputValue(elements.heroPower, 'Sin poder definido'),
    team: getInputValue(elements.heroTeam, 'Sin equipo'),
    created_at: new Date().toISOString(),
  };
}

async function createDatabase() {
  // INVESTIGACION PUNTO 4:
  // Crear la base de datos local heroes en IndexedDB con PouchDB.
  return executeOperation('Crear base de datos heroes', async () => {
    const currentDb = getDb();
    const info = await currentDb.info();
    return {
      db_name: info.db_name,
      doc_count: info.doc_count,
      backend_adapter: info.adapter,
    };
  });
}

async function resetDatabase() {
  return executeOperation('Reiniciar base de datos heroes', async () => {
    const currentDb = getDb();
    await currentDb.destroy();
    db = new window.PouchDB(DB_NAME);
    const info = await db.info();
    renderDocumentsTable([]);

    return {
      destroyed: true,
      new_db_name: info.db_name,
      backend_adapter: info.adapter,
    };
  });
}

async function createPrimaryKeyRecord() {
  // INVESTIGACION PUNTO 5:
  // Clave primaria en PouchDB usando la propiedad _id de forma explicita.
  return executeOperation('Crear registro con clave primaria', async () => {
    const currentDb = getDb();
    const hero = buildPrimaryHeroFromInputs();
    const result = await currentDb.put(hero);

    return {
      inserted_id: result.id,
      rev: result.rev,
      method: 'put con _id explicito',
    };
  });
}

async function addAutoIdUsingDocument() {
  // INVESTIGACION PUNTO 6:
  // Insercion de documento sin _id usando post para autogenerar la clave.
  return executeOperation(
    'Agregar registro con ID auto (documento)',
    async () => {
      const currentDb = getDb();

      const doc = {
        type: 'hero',
        name: `${getInputValue(elements.heroName, 'Hero')}-doc`,
        power: getInputValue(elements.heroPower, 'Sin poder') || 'Sin poder',
        team: getInputValue(elements.heroTeam, 'Sin equipo'),
        created_at: new Date().toISOString(),
        source: 'document',
      };

      const result = await currentDb.post(doc);

      return {
        inserted_id: result.id,
        rev: result.rev,
        method: 'post con documento',
      };
    },
  );
}

async function addAutoIdUsingJson() {
  // INVESTIGACION PUNTO 6:
  // Insercion de objeto JSON sin _id para autogenerar la clave.
  return executeOperation(
    'Agregar registro con ID auto (objeto JSON)',
    async () => {
      const currentDb = getDb();
      const parsedJson = {
        type: 'hero',
        name: getInputValue(elements.heroName, 'Hero JSON'),
        power: getInputValue(elements.heroPower, 'Sin poder'),
        team: getInputValue(elements.heroTeam, 'Sin equipo'),
        created_at: new Date().toISOString(),
        source: 'json',
      };

      const result = await currentDb.post(parsedJson);

      return {
        inserted_id: result.id,
        rev: result.rev,
        method: 'post con objeto JSON desde formulario',
      };
    },
  );
}

async function attachBlobToRecord() {
  // INVESTIGACION PUNTO 7:
  // Adjuntar un archivo binario (BLOB) al documento usando putAttachment.
  return executeOperation('Adjuntar imagen BLOB al registro', async () => {
    const currentDb = getDb();
    const docId = getInputValue(elements.blobDocId, 'hero_blob_demo');
    const selectedFile = elements.blobFile.files && elements.blobFile.files[0];

    if (!selectedFile) {
      throw new Error(
        'Debes seleccionar una imagen antes de adjuntar el BLOB.',
      );
    }

    let targetDoc;

    try {
      targetDoc = await currentDb.get(docId);
    } catch (error) {
      if (error.status !== 404) {
        throw error;
      }

      await currentDb.put({
        _id: docId,
        type: 'hero',
        name: 'Hero con blob',
        power: 'Adjunto de imagen',
        team: 'Demo',
        created_at: new Date().toISOString(),
      });

      targetDoc = await currentDb.get(docId);
    }

    const attachmentName = selectedFile.name || 'archivo-subido';
    const attachmentType = selectedFile.type || 'application/octet-stream';

    const attachmentResult = await currentDb.putAttachment(
      docId,
      attachmentName,
      targetDoc._rev,
      selectedFile,
      attachmentType,
    );

    elements.blobFile.value = '';

    return {
      id: attachmentResult.id,
      rev: attachmentResult.rev,
      attachment_name: attachmentName,
      content_type: attachmentType,
      bytes: selectedFile.size,
    };
  });
}

async function editRecordUsingDocument() {
  // INVESTIGACION PUNTO 8:
  // Editar mediante documento: se consulta, se modifica y se guarda.
  return executeOperation('Editar registro por documento', async () => {
    const currentDb = getDb();
    const id = getInputValue(elements.editId, 'hero_superman');
    const newPower = getInputValue(elements.editPower, 'Poder actualizado');

    const document = await currentDb.get(id);
    document.power = newPower;
    document.updated_method = 'document';
    document.updated_at = new Date().toISOString();

    const result = await currentDb.put(document);

    return {
      id: result.id,
      rev: result.rev,
      method: 'edicion por documento',
    };
  });
}

async function editRecordUsingJson() {
  // INVESTIGACION PUNTO 8:
  // Editar mediante objeto JSON: nuevo objeto con _id y _rev.
  return executeOperation('Editar registro por JSON', async () => {
    const currentDb = getDb();
    const id = getInputValue(elements.editId, 'hero_superman');
    const newPower = getInputValue(
      elements.editPower,
      'Poder actualizado JSON',
    );

    const current = await currentDb.get(id);

    const updatedJson = {
      _id: current._id,
      _rev: current._rev,
      type: current.type || 'hero',
      name: current.name || 'Hero',
      power: newPower,
      team: current.team || 'Sin equipo',
      created_at: current.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_method: 'json',
      source: current.source || 'json',
    };

    if (current._attachments) {
      updatedJson._attachments = current._attachments;
    }

    const result = await currentDb.put(updatedJson);

    return {
      id: result.id,
      rev: result.rev,
      method: 'edicion por JSON',
    };
  });
}

async function deleteRecordUsingDocument() {
  // INVESTIGACION PUNTO 9:
  // Eliminar mediante documento recuperado con get + remove(documento).
  return executeOperation('Eliminar registro por documento', async () => {
    const currentDb = getDb();
    const id = getInputValue(elements.deleteId, 'hero_superman');

    const document = await currentDb.get(id);
    const result = await currentDb.remove(document);

    return {
      id: result.id,
      rev: result.rev,
      method: 'eliminacion por documento',
    };
  });
}

async function deleteRecordUsingJson() {
  // INVESTIGACION PUNTO 9:
  // Eliminar mediante objeto JSON con _id y _rev.
  return executeOperation('Eliminar registro por JSON', async () => {
    const currentDb = getDb();
    const id = getInputValue(elements.deleteId, 'hero_superman');

    const current = await currentDb.get(id);
    const result = await currentDb.remove({
      _id: current._id,
      _rev: current._rev,
    });

    return {
      id: result.id,
      rev: result.rev,
      method: 'eliminacion por JSON',
    };
  });
}

async function listAllRecords() {
  // INVESTIGACION PUNTO 10:
  // Obtener todos los registros con allDocs + include_docs.
  return executeOperation('Listar todos los registros', async () => {
    const currentDb = getDb();

    const response = await currentDb.allDocs({
      include_docs: true,
      attachments: false,
    });

    const documents = response.rows.map((row) => row.doc).filter(Boolean);
    renderDocumentsTable(documents);

    return {
      total_rows: response.total_rows,
      returned_docs: documents.length,
      ids: documents.map((doc) => doc._id),
    };
  });
}

function bindEvents() {
  elements.createDbButton.addEventListener('click', createDatabase);
  elements.resetDbButton.addEventListener('click', resetDatabase);
  elements.listAllButton.addEventListener('click', listAllRecords);
  elements.createPrimaryButton.addEventListener(
    'click',
    createPrimaryKeyRecord,
  );
  elements.addAutoDocumentButton.addEventListener(
    'click',
    addAutoIdUsingDocument,
  );
  elements.addAutoJsonButton.addEventListener('click', addAutoIdUsingJson);
  elements.attachBlobButton.addEventListener('click', attachBlobToRecord);
  elements.editDocumentButton.addEventListener(
    'click',
    editRecordUsingDocument,
  );
  elements.editJsonButton.addEventListener('click', editRecordUsingJson);
  elements.deleteDocumentButton.addEventListener(
    'click',
    deleteRecordUsingDocument,
  );
  elements.deleteJsonButton.addEventListener('click', deleteRecordUsingJson);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    appendLog('info', 'El navegador no soporta Service Worker');
    return;
  }

  navigator.serviceWorker
    .register('./sw.js')
    .then((registration) => {
      appendLog('ok', 'Service Worker registrado', {
        scope: registration.scope,
      });
    })
    .catch((error) => {
      appendLog('error', 'Fallo registro de Service Worker', {
        message: error.message,
      });
    });
}

function init() {
  setupDomReferences();
  bindEvents();
  registerServiceWorker();
  appendLog(
    'info',
    'Proyecto listo. Ejecuta los botones para generar evidencias de IndexedDB.',
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
