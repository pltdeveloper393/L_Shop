import { api } from '../services/api.js';
import { router } from '../main.js';
import { Product } from '../types/index_catalog.js';
import { t } from '../services/locale.js';

let allProducts: Product[] = [];
let sortField = 'id';
let sortDir: 'asc' | 'desc' = 'asc';

export async function renderAdminPage() {
  const app = document.getElementById('app');
  if (!app) return;

  try {
    const me = await api.getMe();
    if (!me.user || (me.user.role !== 'admin' && me.user.role !== 'owner')) {
      router.navigateTo('/main');
      return;
    }

    const res = await fetch('/api/catalog');
    const data = await res.json();
    allProducts = data.products || [];
    applySort();

    app.innerHTML = `
      <div class="wot-container">
        <div class="admin-header">
          <div class="header-left">
            <h1 class="shop-title">IYHAN<span class="accent">SHOP</span> / <span class="admin-title">${t('admin.title')}</span></h1>
          </div>
          <div class="header-right">
            <button class="wot-btn" id="admin-main-btn">
              <i class="fas fa-home btn-icon"></i>
              ${t('nav.home')}
            </button>
            <button class="wot-btn" id="admin-catalog-btn">
              <i class="fas fa-store btn-icon"></i>
              ${t('nav.catalog')}
            </button>
            <button class="wot-btn" id="admin-logout-btn">
              <i class="fas fa-sign-out-alt btn-icon"></i>
              ${t('nav.logout')}
            </button>
          </div>
        </div>

        <div class="admin-section">
          <div class="admin-section-header">
            <h2 class="section-title" style="margin-bottom: 0;">
              <i class="fas fa-list"></i>
              ${t('nav.catalog')}
            </h2>
            <button class="wot-btn wot-btn-primary" id="admin-add-btn">
              <i class="fas fa-plus"></i> ${t('admin.addProduct')}
            </button>
          </div>
          <div class="admin-table-wrapper">
            <table class="wot-table">
              <thead>
                <tr>
                  <th class="sortable active asc" data-sort="id">ID</th>
                  <th class="sortable" data-sort="name">${t('admin.name')}</th>
                  <th class="sortable" data-sort="nation">${t('admin.nation')}</th>
                  <th class="sortable" data-sort="type">${t('admin.type')}</th>
                  <th class="sortable" data-sort="level">${t('admin.level')}</th>
                  <th class="sortable" data-sort="price">${t('admin.price')}</th>
                  <th>${t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody id="admin-products-tbody"></tbody>
            </table>
          </div>
        </div>

        <div class="modal-overlay" id="admin-add-modal" style="display: none;">
          <div class="modal-content" id="admin-add-content"></div>
        </div>

        <div class="modal-overlay" id="admin-edit-modal" style="display: none;">
          <div class="modal-content" id="admin-edit-content"></div>
        </div>
      </div>
    `;

    renderTable();

    setupAdminListeners();

  } catch {
    router.navigateTo('/main');
  }
}

function setupAdminListeners() {
  document.getElementById('admin-main-btn')?.addEventListener('click', () => router.navigateTo('/main'));
  document.getElementById('admin-catalog-btn')?.addEventListener('click', () => router.navigateTo('/catalog'));
  document.getElementById('admin-logout-btn')?.addEventListener('click', async () => {
    await api.logout();
    router.navigateTo('/');
  });

  document.getElementById('admin-add-btn')?.addEventListener('click', openAddModal);

  document.querySelectorAll('.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const field = (th as HTMLElement).getAttribute('data-sort') || 'id';
      if (field === sortField) {
        sortDir = sortDir === 'asc' ? 'desc' : 'asc';
      } else {
        sortField = field;
        sortDir = 'asc';
      }
      applySort();
      document.querySelectorAll('.sortable').forEach(el => el.classList.remove('active', 'asc', 'desc'));
      th.classList.add('active', sortDir);
      renderTable();
    });
  });
}

function applySort() {
  allProducts.sort((a, b) => {
    const va: any = (a as any)[sortField];
    const vb: any = (b as any)[sortField];
    const av = va == null ? '' : va;
    const bv = vb == null ? '' : vb;
    let cmp: number;
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      cmp = String(av).localeCompare(String(bv));
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });
}

function renderTable() {
  const tbody = document.getElementById('admin-products-tbody');
  if (!tbody) return;

  tbody.innerHTML = allProducts.map(p => `
    <tr>
      <td>${p.id}</td>
      <td>${p.name}</td>
      <td>${p.nation}</td>
      <td>${p.type}</td>
      <td>${p.level}</td>
      <td>${p.price.toLocaleString()}</td>
      <td>
        <button class="wot-btn wot-btn-primary admin-edit-btn" data-id="${p.id}" style="padding: 5px 10px; font-size: 0.8rem;">
          <i class="fas fa-edit"></i>
        </button>
        <button class="wot-btn admin-delete-btn" data-id="${p.id}" style="padding: 5px 10px; font-size: 0.8rem; background: #d32f2f;">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.admin-edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id') || '0');
      openEditModal(id);
    });
  });

  document.querySelectorAll('.admin-delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = parseInt((e.currentTarget as HTMLElement).getAttribute('data-id') || '0');
      if (!confirm(`Удалить товар #${id}?`)) return;
      try {
        const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Ошибка при удалении');
        renderAdminPage();
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Ошибка при удалении');
      }
    });
  });
}

function closeModal(id: string) {
  const overlay = document.getElementById(id);
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

function openAddModal() {
  const overlay = document.getElementById('admin-add-modal');
  const content = document.getElementById('admin-add-content');
  if (!overlay || !content) return;

  document.body.style.overflow = 'hidden';

  content.innerHTML = `
    <div class="admin-edit-form">
      <h3>${t('admin.addProduct')}</h3>
      <form id="admin-add-form-inner">
        <div class="admin-form-row">
          <div class="form-group" style="flex:2">
            <label>${t('admin.name')} *</label>
            <input type="text" id="am-name" class="wot-input" required>
          </div>
          <div class="form-group" style="flex:1">
            <label>${t('admin.price')} *</label>
            <input type="number" id="am-price" class="wot-input" required>
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>${t('admin.nation')}</label>
            <select id="am-nation" class="wot-select">
              <option value="ussr">${t('nation.ussr')}</option>
              <option value="germany">${t('nation.germany')}</option>
              <option value="usa">${t('nation.usa')}</option>
              <option value="france">${t('nation.france')}</option>
              <option value="uk">${t('nation.uk')}</option>
              <option value="china">${t('nation.china')}</option>
              <option value="japan">${t('nation.japan')}</option>
              <option value="czech">${t('nation.czech')}</option>
              <option value="sweden">${t('nation.sweden')}</option>
              <option value="italy">${t('nation.italy')}</option>
              <option value="other">${t('nation.other')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t('admin.type')}</label>
            <select id="am-type" class="wot-select">
              <option value="heavy">${t('type.heavy')}</option>
              <option value="medium">${t('type.medium')}</option>
              <option value="light">${t('type.light')}</option>
              <option value="at">${t('type.at')}</option>
            </select>
          </div>
          <div class="form-group">
            <label>${t('admin.level')}</label>
            <input type="number" id="am-level" class="wot-input" value="8">
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>HP</label>
            <input type="text" id="am-hp" class="wot-input" placeholder="1 500">
          </div>
          <div class="form-group">
            <label>DMG</label>
            <input type="text" id="am-dmg" class="wot-input" placeholder="320">
          </div>
          <div class="form-group">
            <label>DPM</label>
            <input type="text" id="am-dpm" class="wot-input" placeholder="2 000">
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>ACC</label>
            <input type="text" id="am-ptrs" class="wot-input" placeholder="0.35">
          </div>
          <div class="form-group">
            <label>TRAV</label>
            <input type="text" id="am-ptrp" class="wot-input" placeholder="30">
          </div>
          <div class="form-group">
            <label>SPD</label>
            <input type="text" id="am-spw" class="wot-input" placeholder="40">
          </div>
        </div>
        <div class="admin-form-row photo-row">
          <div class="form-group file-upload-group">
            <label>${t('admin.tankPhoto')}</label>
            <div class="photo-upload-wrapper">
              <label class="custom-file-upload">
                <input type="file" id="am-img" accept="image/png,image/jpeg,image/webp,image/gif">
                <i class="fas fa-camera"></i>
                <span id="am-img-label">${t('admin.chooseFile')}</span>
              </label>
              <div class="image-preview" id="am-img-preview" style="display:none">
                <img src="" alt="preview">
              </div>
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="am-instock" checked>
            <span>${t('admin.inStock')}</span>
          </label>
        </div>
        <div class="form-group">
          <label>${t('admin.description')}</label>
          <textarea id="am-desc" class="wot-input" rows="2"></textarea>
        </div>
        <div class="admin-form-actions">
          <button type="submit" class="wot-btn wot-btn-primary">
            <i class="fas fa-plus"></i> ${t('admin.addProduct')}
          </button>
          <button type="button" class="wot-btn" id="admin-add-close">
            <i class="fas fa-times"></i> ${t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.style.display = 'flex';

  document.getElementById('admin-add-close')?.addEventListener('click', () => closeModal('admin-add-modal'));

  document.getElementById('am-img')?.addEventListener('change', function() {
    const label = document.getElementById('am-img-label');
    const preview = document.getElementById('am-img-preview');
    const previewImg = preview?.querySelector('img');
    const files = (this as HTMLInputElement).files;
    if (files && files[0]) {
      if (label) label.textContent = files[0].name;
      if (preview && previewImg) {
        previewImg.src = URL.createObjectURL(files[0]);
        preview.style.display = 'flex';
      }
    }
  });

  document.getElementById('admin-add-form-inner')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    const fd = new FormData();
    fd.append('name', (document.getElementById('am-name') as HTMLInputElement).value);
    fd.append('price', (document.getElementById('am-price') as HTMLInputElement).value);
    fd.append('nation', (document.getElementById('am-nation') as HTMLSelectElement).value);
    fd.append('type', (document.getElementById('am-type') as HTMLSelectElement).value);
    fd.append('level', (document.getElementById('am-level') as HTMLInputElement).value);
    fd.append('hp', (document.getElementById('am-hp') as HTMLInputElement).value || '0');
    fd.append('dmg', (document.getElementById('am-dmg') as HTMLInputElement).value || '0');
    fd.append('dpm', (document.getElementById('am-dpm') as HTMLInputElement).value || '0');
    fd.append('ptrs', (document.getElementById('am-ptrs') as HTMLInputElement).value || '0');
    fd.append('ptrp', (document.getElementById('am-ptrp') as HTMLInputElement).value || '0');
    fd.append('spw', (document.getElementById('am-spw') as HTMLInputElement).value || '0');
    fd.append('inStock', (document.getElementById('am-instock') as HTMLInputElement).checked ? 'true' : 'false');
    fd.append('description', (document.getElementById('am-desc') as HTMLTextAreaElement).value || '');
    const fileInput = document.getElementById('am-img') as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      fd.append('image', fileInput.files[0]);
    }

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка при создании товара');
      closeModal('admin-add-modal');
      renderAdminPage();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Ошибка при создании товара');
      btn.disabled = false;
      btn.innerHTML = `<i class="fas fa-plus"></i> ${t('admin.addProduct')}`;
    }
  });
}

function openEditModal(id: number) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  const overlay = document.getElementById('admin-edit-modal');
  const content = document.getElementById('admin-edit-content');
  if (!overlay || !content) return;

  document.body.style.overflow = 'hidden';

  const hasImage = product.img && product.img.startsWith('images/');

  content.innerHTML = `
    <div class="admin-edit-form">
      <h3>${t('admin.editProduct')}: ${product.name}</h3>
      <form id="admin-edit-form-inner">
        <div class="admin-form-row">
          <div class="form-group" style="flex:2">
            <label>${t('admin.name')}</label>
            <input type="text" id="ef-name" class="wot-input" value="${product.name}">
          </div>
          <div class="form-group" style="flex:1">
            <label>${t('admin.price')}</label>
            <input type="number" id="ef-price" class="wot-input" value="${product.price}">
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>${t('admin.nation')}</label>
            <select id="ef-nation" class="wot-select">
              ${['ussr','germany','usa','france','uk','china','japan','czech','sweden','italy','other'].map(n =>
                `<option value="${n}" ${product.nation === n ? 'selected' : ''}>${n}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t('admin.type')}</label>
            <select id="ef-type" class="wot-select">
              ${['heavy','medium','light','at'].map(tp =>
                `<option value="${tp}" ${product.type === tp ? 'selected' : ''}>${tp}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>${t('admin.level')}</label>
            <input type="number" id="ef-level" class="wot-input" value="${product.level}">
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>HP</label>
            <input type="text" id="ef-hp" class="wot-input" value="${product.hp}">
          </div>
          <div class="form-group">
            <label>DMG</label>
            <input type="text" id="ef-dmg" class="wot-input" value="${product.dmg}">
          </div>
          <div class="form-group">
            <label>DPM</label>
            <input type="text" id="ef-dpm" class="wot-input" value="${product.dpm}">
          </div>
        </div>
        <div class="admin-form-row">
          <div class="form-group">
            <label>ACC</label>
            <input type="text" id="ef-ptrs" class="wot-input" value="${product.ptrs || ''}">
          </div>
          <div class="form-group">
            <label>TRAV</label>
            <input type="text" id="ef-ptrp" class="wot-input" value="${product.ptrp || ''}">
          </div>
          <div class="form-group">
            <label>SPD</label>
            <input type="text" id="ef-spw" class="wot-input" value="${product.spw || ''}">
          </div>
        </div>
        <div class="admin-form-row photo-row">
          <div class="form-group file-upload-group">
            <label>${t('admin.tankPhoto')}</label>
            <div class="photo-upload-wrapper">
              <label class="custom-file-upload">
                <input type="file" id="ef-img" accept="image/png,image/jpeg,image/webp,image/gif">
                <i class="fas fa-camera"></i>
                <span id="ef-img-label">${t('admin.chooseFile')}</span>
              </label>
              <div class="image-preview" id="ef-img-preview" style="display:${hasImage ? 'flex' : 'none'}">
                ${hasImage ? `<img src="/${product.img}" alt="${product.name}">` : `<img src="" alt="preview">`}
              </div>
              ${hasImage ? `
                <button type="button" class="wot-btn admin-del-image-btn" data-id="${product.id}" style="background:#d32f2f;padding:3px 8px;font-size:0.75rem;">
                  <i class="fas fa-trash"></i> ${t('admin.deletePhoto')}
                </button>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="ef-instock" ${product.inStock ? 'checked' : ''}>
            <span>${t('admin.inStock')}</span>
          </label>
        </div>
        <div class="form-group">
          <label>${t('admin.description')}</label>
          <textarea id="ef-desc" class="wot-input" rows="2">${product.description || ''}</textarea>
        </div>
        <div class="admin-form-actions">
          <button type="submit" class="wot-btn wot-btn-primary">
            <i class="fas fa-save"></i> ${t('admin.save')}
          </button>
          <button type="button" class="wot-btn" id="admin-edit-close">
            <i class="fas fa-times"></i> ${t('admin.cancel')}
          </button>
        </div>
      </form>
    </div>
  `;

  overlay.style.display = 'flex';

  document.getElementById('admin-edit-close')?.addEventListener('click', () => closeModal('admin-edit-modal'));

  document.getElementById('ef-img')?.addEventListener('change', function() {
    const label = document.getElementById('ef-img-label');
    const preview = document.getElementById('ef-img-preview');
    const previewImg = preview?.querySelector('img');
    const files = (this as HTMLInputElement).files;
    if (files && files[0]) {
      if (label) label.textContent = files[0].name;
      if (preview && previewImg) {
        previewImg.src = URL.createObjectURL(files[0]);
        preview.style.display = 'flex';
      }
    }
  });

  document.getElementById('admin-edit-form-inner')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append('name', (document.getElementById('ef-name') as HTMLInputElement).value);
    fd.append('price', (document.getElementById('ef-price') as HTMLInputElement).value);
    fd.append('nation', (document.getElementById('ef-nation') as HTMLSelectElement).value);
    fd.append('type', (document.getElementById('ef-type') as HTMLSelectElement).value);
    fd.append('level', (document.getElementById('ef-level') as HTMLInputElement).value);
    fd.append('hp', (document.getElementById('ef-hp') as HTMLInputElement).value);
    fd.append('dmg', (document.getElementById('ef-dmg') as HTMLInputElement).value);
    fd.append('dpm', (document.getElementById('ef-dpm') as HTMLInputElement).value);
    fd.append('ptrs', (document.getElementById('ef-ptrs') as HTMLInputElement).value || '0');
    fd.append('ptrp', (document.getElementById('ef-ptrp') as HTMLInputElement).value || '0');
    fd.append('spw', (document.getElementById('ef-spw') as HTMLInputElement).value || '0');
    fd.append('inStock', (document.getElementById('ef-instock') as HTMLInputElement).checked ? 'true' : 'false');
    fd.append('description', (document.getElementById('ef-desc') as HTMLTextAreaElement).value || '');

    const fileInput = document.getElementById('ef-img') as HTMLInputElement;
    if (fileInput.files && fileInput.files[0]) {
      fd.append('image', fileInput.files[0]);
    }

    try {
      const res = await fetch(`/api/catalog/${id}`, {
        method: 'PUT',
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка при обновлении');
      closeModal('admin-edit-modal');
      renderAdminPage();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Ошибка при обновлении');
    }
  });

  document.querySelector('.admin-del-image-btn')?.addEventListener('click', async (e) => {
    const target = e.currentTarget as HTMLElement;
    const productId = target.getAttribute('data-id');
    if (!productId || !confirm(t('admin.confirmDeletePhoto'))) return;

    try {
      const res = await fetch(`/api/catalog/${productId}/image`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка при удалении фото');
      renderAdminPage();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Ошибка при удалении фото');
    }
  });
}
