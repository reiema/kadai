// public/index.js
window.addEventListener('DOMContentLoaded', (event) => {
    // 商品名をクリックしたときにアラートを表示
    document.querySelectorAll('.product-name').forEach((elem) => {
      elem.addEventListener('click', (event) => {
        alert(`商品名: ${event.target.innerHTML}`);
      });
    });
  
    // 入力された商品名をカートに追加するリクエストを送信
    document.querySelector('.send-button').addEventListener('click', (event) => {
      const text = document.querySelector('.input-text').value;
      fetch('/api/cart', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ name: text }) 
      })
      .then(response => response.text())
      .then(data => {
        alert(`Response: ${data}`);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  
    // カートの合計金額を取得して表示
    document.querySelector('.get-total-button').addEventListener('click', (event) => {
      fetch('/api/cart/total')
      .then(response => response.json())
      .then(data => {
        alert(`カートの合計金額は: ¥${data.total} です`);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    });
  });
  