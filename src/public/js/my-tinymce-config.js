
tinymce.init({
  selector: 'textarea.tinymce',
  plugins: 'lists link image table code preview fullscreen wordcount align',
  toolbar: 'undo redo | bold italic underline | bullist numlist | link image table | alignleft aligncenter alignright | preview code fullscreen',
    /* enable title field in the Image dialog*/
    image_title: true,
    /* enable automatic uploads of images represented by blob or data URIs*/
    automatic_uploads: true,
    /*
      URL of our upload handler (for more details check: https://www.tiny.cloud/docs/configure/file-image-upload/#images_upload_url)
      images_upload_url: 'postAcceptor.php',
      here we add custom filepicker only to Image dialog
    */
    file_picker_types: 'image',
    /* and here's our custom image picker*/
    file_picker_callback: (cb, value, meta) => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')

      input.addEventListener('change', (e) => {
        const file = e.target.files[0]

        // Thêm file vào FormData
        const formData = new FormData()
        formData.append('tinyMCE', file)

        // Hiển thị spinner (loading)
        const loadingIndicator = document.createElement('div')
        loadingIndicator.classList.add('loading-indicator')
        loadingIndicator.innerHTML = 'Đang tải ảnh...'
        document.body.appendChild(loadingIndicator) 

        // Gửi file đến server
        axios.post('/posts/upload/tinymce', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        })
        .then((response) => {
          const result = response.data
          if(result){

            // Nếu upload thành công, trả về URL của ảnh
            cb(result.url, { alt: file.name })

             // Ẩn spinner (loading) sau khi tải thành công
             document.body.removeChild(loadingIndicator);
             
          }
        })
        .catch((error) => {
          console.error('Error uploading image:', error)
          alert('Có lỗi xảy ra khi tải lên ảnh. Vui lòng thử lại.')
        })
      })

      input.click()

    },
    content_style: 'body { font-family:Helvetica,Arial,sans-serif font-size:16px }'
  })

