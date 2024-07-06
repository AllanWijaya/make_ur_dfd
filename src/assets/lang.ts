// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      renamefile: "Rename file",
      datastoreerror: "DFD Level 0 can't use Data Store",
      processerror: "DFD Level 0 only need 1 process",
      arrange: "Arrange",
      bringf: "Bring Forward",
      sendb: "Send Backward",
      extras: "Extras",
      tofront: "To Front",
      toback: "To Back",
      view: "View",
      reset: "Reset View",
      zoomin: "Zoom In",
      zoomout: "Zoom Out",
      selall: "Select All",
      selnon: "Select None",
      delete: "Delete",
      cut: "Cut",
      copy: "Copy",
      paste: "Paste",
      dup: "Duplicate",
      file: "File",
      edit: "Edit",
      undo: "Undo",
      redo: "Redo",
      notif_bhs: "Successfully change to English",
      lang: "English",
      print: "Print",
      makea: "Make a copy",
      import: "Import",
      export: "Export to image",
      new: "New",
      openn: "Open",
      save: "Save",
      saveas: "Save as",
      entity: "Entity",
      process: "Process",
      datastore: "Data Store",
      edge: "Data Flow should not use verbs",
      symbol: "Convert Symbol",
      language: "Language",
      welcome: "Welcome",
      description: "This is an example of a bilingual application.",
      // Add more translations here
    },
  },
  id: {
    translation: {
      renamefile: "Mengubah nama berkas",
      datastoreerror: "DFD Level 0 tidak bisa menggunakan Gudang Data",
      processerror: "DFD Level 0 hanya membutuhkan 1 Proses",
      arrange: "Susunan",
      bringf: "Pindahkan Ke Depan",
      sendb: "Pindahkan Ke Belakang",
      extras: "Ekstra",
      tofront: "Ke Depan",
      toback: "Ke Belakang",
      view: "Tampilan",
      reset: "Atur Ulang Tampilan",
      zoomin: "Perbesar",
      zoomout: "Perkecil",
      selall: "Pilih semua",
      selnon: "Tidak memilih",
      delete: "Hapus",
      cut: "Potong",
      copy: "Salin",
      paste: "Tempel",
      dup: "Duplikat",
      file: "Berkas",
      edit: "Ubah",
      undo: "Batalkan",
      redo: "Ulangi",
      notif_bhs: "Berhasil mengubah ke Bahasa Indonesia",
      lang: "Bahasa",
      print: "Cetak",
      makea: "Buatkan salinan",
      import: "Impor",
      export: "Ekspor ke gambar",
      new: "Baru",
      openn: "Buka",
      save: "Simpan",
      saveas: "Simpan di",
      entity: "Entitas",
      process: "Proses",
      datastore: "Gudang Data",
      edge: "Data Flow tidak boleh menggunakan kata kerja",
      symbol: "Ubah Simbol",
      language: "Bahasa",
      welcome: "Selamat Datang",
      description: "Ini adalah contoh aplikasi dua bahasa.",
      // Add more translations here
    },
  },
};

i18n
  .use(initReactI18next) // Integrates with React
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en", // Fallback language if translation is missing
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
