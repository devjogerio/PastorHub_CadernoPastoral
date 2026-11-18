/* Foto de perfil: recorte quadrado centralizado e compressão para caber no armazenamento local */
(function () {
  window.lerImagemRedimensionada = function (file, tamanho) {
    const lado = tamanho || 256;
    return new Promise((resolve, reject) => {
      if (!file || !/^image\//.test(file.type)) {
        reject(new Error('O arquivo selecionado não é uma imagem'));
        return;
      }
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Não foi possível ler a imagem'));
        img.onload = () => {
          const corte = Math.min(img.width, img.height);
          const sx = (img.width - corte) / 2;
          const sy = (img.height - corte) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = lado;
          canvas.height = lado;
          canvas.getContext('2d').drawImage(img, sx, sy, corte, corte, 0, 0, lado, lado);
          resolve(canvas.toDataURL('image/jpeg', 0.86));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  };
})();
