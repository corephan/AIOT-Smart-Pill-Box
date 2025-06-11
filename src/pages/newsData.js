const newsData = {
  'Ung thư': [
    {
      title: 'Giải mã những câu hỏi lớn về ung thư',
      image: 'https://i1-suckhoe.vnecdn.net/2025/02/04/23well-cancer-mysteries-image-5944-5160-1738651063.png?w=1020&h=0&q=100&dpr=1&fit=crop&s=gtJaTtpw6bZMEF9rTMsqBw',
      link: 'https://vnexpress.net/giai-ma-nhung-cau-hoi-lon-ve-ung-thu-4845656.html'
    },
    {
      title: 'Phát hiện ung thư từ dấu hiệu nuốt vướng, sụt cân',
      image: 'https://i1-suckhoe.vnecdn.net/2025/05/28/A-nh-ma-n-hi-nh-2025-05-28-lu-6211-8686-1748423756.png?w=1020&h=0&q=100&dpr=1&fit=crop&s=v8enUozx6WisJODu4IH2Bw',
      link: 'https://vnexpress.net/suc-khoe-cam-nang-phat-hien-ung-thu-tu-dau-hieu-nuot-vuong-sut-can-4891529.html'
    },
    {
      title: 'Bí quyết phòng ung thư từ gian bếp nhà bạn',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/5/15/cac-loai-qua-mong-nhu-viet-quat-mam-xoi-giau-chat-chong-oxy-hoa-ho-tro-phong-ngua-ung-thu-va-tang-cuong-mien-dich-17472780490861885916092.jpg',
      link: 'https://suckhoedoisong.vn/bi-quyet-phong-ung-thu-tu-gian-bep-nha-ban-169250515100352553.htm'
    }
  ],
  'Tiểu đường': [
    {
      title: 'Tự kiểm tra mắt ngay! Nếu có một trong 4 đặc điểm này, chỉ sợ máu đã “ngập đường"',
      image: 'https://kenh14cdn.com/thumb_w/640/203336854389633024/2025/5/28/197-1748440400209679362119.jpg',
      link: 'https://kenh14.vn/tu-kiem-tra-mat-ngay-neu-co-mot-trong-4-dac-diem-nay-chi-so-mau-da-ngap-duong-215250528205852707.chn'
    },
    {
      title: 'Tiểu đường type 2: Nguyên nhân, triệu chứng, cách điều trị và phòng bệnh',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2024/10/25/document-17098071894431045919374-17298410071051831503308.jpg',
      link: 'https://suckhoedoisong.vn/tieu-duong-type-2-nguyen-nhan-trieu-chung-cach-dieu-tri-va-phong-benh-169241025135634256.htm'
    },
    {
      title: 'Ai có nguy cơ mắc tiểu đường thai kỳ?',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/5/25/phu-nu-mang-thai-co-the-bi-dai-thao-duong-thai-ky-1748146610726-17481466112161607275721.jpg',
      link: 'https://suckhoedoisong.vn/ai-co-nguy-co-mac-tieu-duong-thai-ky-169250525111832047.htm'
    }
  ],
  'Gan thận': [
    {
      title: '4 thực phẩm đầu độc gan "mạnh như rượu" nhưng lại là món khoái khẩu nhiều người ăn mỗi ngày',
      image: 'https://kenh14cdn.com/203336854389633024/2024/12/6/4-17334521102851381653320.png',
      link: 'https://kenh14.vn/4-thuc-pham-dau-doc-gan-manh-nhu-ruou-nhung-lai-la-mon-khoai-khau-nhieu-nguoi-an-moi-ngay-215241206093254663.chn'
    },
    {
      title: '6 cách tự nhiên giúp giảm mỡ gan',
      image: 'https://tse4.mm.bing.net/th?id=OIP._hjBL8vtacAyvDdvPM_BdQHaEK&pid=Api&P=0&h=220',
      link: 'https://vnexpress.net/6-cach-tu-nhien-giup-giam-mo-gan-4890132.html'
    }
  ],
  'Da liễu': [
    {
      title: 'CHĂM SÓC VÀ ĐIỀU TRỊ DA NHẠY CẢM',
      image: 'https://tapchidalieu.com/wp-content/uploads/2022/02/cham_soc_va_dieu_tri_da_nhay_cam_1.jpg',
      link: 'https://tapchidalieu.com/cham-soc-va-dieu-tri-da-nhay-cam/'
    }
  ],
  'Tim mạch': [
    {
      title: 'Giáo sư Nhật 87 tuổi có hệ tim mạch “trẻ” hơn ít nhất 10 tuổi nhờ 7 bí quyết đơn giản đến bất ngờ',
      image: 'https://kenh14cdn.com/203336854389633024/2024/12/10/11takamura-1-790x480-1733840771478537818953.jpg',
      link: 'https://kenh14.vn/giao-su-nhat-87-tuoi-co-he-tim-mach-tre-hon-it-nhat-10-tuoi-nho-7-bi-quyet-don-gian-den-bat-ngo-215241210213255161.chn'
    }
  ],
  'Hô hấp': [
    {
      title: '8 cách tự nhiên tuyệt vời nhất để “làm sạch” phổi, không tốn kém nhưng hiệu quả vô cùng',
      image: 'https://kenh14cdn.com/203336854389633024/2025/4/7/3a-17440369829751842807874.jpg',
      link: 'https://kenh14.vn/8-cach-tu-nhien-tuyet-voi-nhat-de-lam-sach-phoi-khong-ton-kem-nhung-hieu-qua-vo-cung-215250407215411524.chn'
    },
    {
      title: 'Nguy cơ viêm phổi khi nhiễm biến thể mới của Covid-19',
      image: 'https://i1-suckhoe.vnecdn.net/2025/05/27/bs-nga-n-1748303816-1748303991-4838-1748304048.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=wZ_OmigdR2n5BxiNJyNEPQ',
      link: 'https://vnexpress.net/nguy-co-viem-phoi-khi-nhiem-bien-the-moi-cua-covid-19-4890865.html'
    }
  ],
  'Thần kinh': [
    {
      title: 'Các bệnh lý thần kinh nguy hiểm',
      image: 'https://i1-suckhoe.vnecdn.net/2022/03/17/002-3301-1647518158.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=-Wnmfki_GzDyPHBFvnSH5w',
      link: 'https://vnexpress.net/cac-benh-ly-than-kinh-nguy-hiem-4440169.html'
    },
    {
      title: '5 món ăn giàu vitamin B12 tốt cho não',
      image: 'https://i1-suckhoe.vnecdn.net/2025/05/27/hau-1748320001.jpg?w=1200&h=0&q=100&dpr=2&fit=crop&s=1mTKLSq7fCV6U68H7GaVoQ',
      link: 'https://vnexpress.net/5-mon-an-giau-vitamin-b12-tot-cho-nao-4891044.html'
    },
    {
      title: 'Dấu hiệu liệt dây thần kinh số 7',
      image: 'https://i1-suckhoe.vnecdn.net/2025/03/21/z6428472692719-bc82340cf2d82da-1789-6769-1742569044.jpg?w=1020&h=0&q=100&dpr=1&fit=crop&s=V5hTK0sij96SbiE-AX3dmQ',
      link: 'https://vnexpress.net/dau-hieu-liet-day-than-kinh-so-7-4864394.html'
    },
    {
      title: '5 đồ uống có thể phòng đột quỵ',
      image: 'https://i1-suckhoe.vnecdn.net/2025/05/02/tra-xanh-1746180116.png?w=1200&h=0&q=100&dpr=2&fit=crop&s=j3NJEUGcFtk8vDO9QvLIbQ',
      link: 'https://vnexpress.net/5-do-uong-co-the-phong-dot-quy-4881029.html'
    } 
  ],
  'Xương khớp': [
    {
      title: '5 tư thế ngồi gây hại cho cột sống',
      image: 'https://i1-suckhoe.vnecdn.net/2025/05/02/tra-xanh-1746180116.png?w=1200&h=0&q=100&dpr=2&fit=crop&s=j3NJEUGcFtk8vDO9QvLIbQ',
      link: 'https://vnexpress.net/5-tu-the-ngoi-gay-hai-cho-cot-song-4892044.html'
    }
  ],
  'Tiêu hóa': [
    {
      title: 'Món ăn bài thuốc hỗ trợ trị rối loạn tiêu hóa mùa hè',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/5/28/nuoc-ep-rau-ma-tot-cho-tim-mach-2048x1365-17483966299631717139527.jpg',
      link: 'https://suckhoedoisong.vn/mon-an-bai-thuoc-ho-tro-tri-roi-loan-tieu-hoa-mua-he-169250528085749037.htm'
    },
    {
      title: 'Lô hội – Thảo dược tự nhiên giúp cải thiện táo bón và bảo vệ hệ tiêu hóa',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/5/20/1-17477467060191840310655.png',
      link: 'https://suckhoedoisong.vn/lo-hoi-thao-duoc-tu-nhien-giup-cai-thien-tao-bon-va-bao-ve-he-tieu-hoa-169250520201504459.htm'
    }
  ],
  'Nhi khoa': [
    {
      title: 'Phòng ngừa viêm đường hô hấp trên ở trẻ bằng những thói quen đơn giản',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/5/13/tre-nho-thuong-xuyen-bi-ho-so-mui-khi-thoi-tiet-thay-doi-hoac-tiep-xuc-moi-truong-dieu-hoa-lanh-de-dan-den-viem-duong-ho-hap-tren-17471225992411659559395.jpg',
      link: 'https://suckhoedoisong.vn/phong-ngua-viem-duong-ho-hap-tren-o-tre-bang-nhung-thoi-quen-don-gian-16925051314522686.htm'
    },
    {
      title: 'Biến chứng nguy hiểm của sốt siêu vi ở trẻ em',
      image: 'https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2025/4/26/photo-1745663416041-1745663416594650699665.jpeg',
      link: 'https://suckhoedoisong.vn/bien-chung-nguy-hiem-cua-sot-sieu-vi-o-tre-em-169250426175144906.htm'
    },
    
  ]
};

export default newsData;
