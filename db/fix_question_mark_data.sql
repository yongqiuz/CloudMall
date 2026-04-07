
SET NAMES utf8mb4;

UPDATE shangpinfenlei
SET leixing = CASE MOD(id,24)
  WHEN 1 THEN '美妆护肤'
  WHEN 2 THEN '食品生鲜'
  WHEN 3 THEN '家居家纺'
  WHEN 4 THEN '家用电器'
  WHEN 5 THEN '手机数码'
  WHEN 6 THEN '电脑办公'
  WHEN 7 THEN '服饰内衣'
  WHEN 8 THEN '鞋靴箱包'
  WHEN 9 THEN '运动户外'
  WHEN 10 THEN '母婴玩具'
  WHEN 11 THEN '图书文娱'
  WHEN 12 THEN '汽车用品'
  WHEN 13 THEN '珠宝配饰'
  WHEN 14 THEN '宠物生活'
  WHEN 15 THEN '厨房用具'
  WHEN 16 THEN '家装建材'
  WHEN 17 THEN '家具收纳'
  WHEN 18 THEN '健康保健'
  WHEN 19 THEN '个护清洁'
  WHEN 20 THEN '酒水饮料'
  WHEN 21 THEN '钟表眼镜'
  WHEN 22 THEN '潮流新品'
  WHEN 23 THEN '品质好货'
  WHEN 0 THEN '每日必买'
END;

UPDATE shangpinxinxi
SET shangpinleixing = CASE MOD(id,24)
  WHEN 1 THEN '美妆护肤'
  WHEN 2 THEN '食品生鲜'
  WHEN 3 THEN '家居家纺'
  WHEN 4 THEN '家用电器'
  WHEN 5 THEN '手机数码'
  WHEN 6 THEN '电脑办公'
  WHEN 7 THEN '服饰内衣'
  WHEN 8 THEN '鞋靴箱包'
  WHEN 9 THEN '运动户外'
  WHEN 10 THEN '母婴玩具'
  WHEN 11 THEN '图书文娱'
  WHEN 12 THEN '汽车用品'
  WHEN 13 THEN '珠宝配饰'
  WHEN 14 THEN '宠物生活'
  WHEN 15 THEN '厨房用具'
  WHEN 16 THEN '家装建材'
  WHEN 17 THEN '家具收纳'
  WHEN 18 THEN '健康保健'
  WHEN 19 THEN '个护清洁'
  WHEN 20 THEN '酒水饮料'
  WHEN 21 THEN '钟表眼镜'
  WHEN 22 THEN '潮流新品'
  WHEN 23 THEN '品质好货'
  WHEN 0 THEN '每日必买'
END,
    shangpinmingcheng = CONCAT((CASE MOD(id,24)
  WHEN 1 THEN '美妆护肤'
  WHEN 2 THEN '食品生鲜'
  WHEN 3 THEN '家居家纺'
  WHEN 4 THEN '家用电器'
  WHEN 5 THEN '手机数码'
  WHEN 6 THEN '电脑办公'
  WHEN 7 THEN '服饰内衣'
  WHEN 8 THEN '鞋靴箱包'
  WHEN 9 THEN '运动户外'
  WHEN 10 THEN '母婴玩具'
  WHEN 11 THEN '图书文娱'
  WHEN 12 THEN '汽车用品'
  WHEN 13 THEN '珠宝配饰'
  WHEN 14 THEN '宠物生活'
  WHEN 15 THEN '厨房用具'
  WHEN 16 THEN '家装建材'
  WHEN 17 THEN '家具收纳'
  WHEN 18 THEN '健康保健'
  WHEN 19 THEN '个护清洁'
  WHEN 20 THEN '酒水饮料'
  WHEN 21 THEN '钟表眼镜'
  WHEN 22 THEN '潮流新品'
  WHEN 23 THEN '品质好货'
  WHEN 0 THEN '每日必买'
END), '精选商品', id),
    guige = CONCAT('官方标配 | 库存', IFNULL(alllimittimes, 99)),
    shangpinjieshao = CONCAT('这是', (CASE MOD(id,24)
  WHEN 1 THEN '美妆护肤'
  WHEN 2 THEN '食品生鲜'
  WHEN 3 THEN '家居家纺'
  WHEN 4 THEN '家用电器'
  WHEN 5 THEN '手机数码'
  WHEN 6 THEN '电脑办公'
  WHEN 7 THEN '服饰内衣'
  WHEN 8 THEN '鞋靴箱包'
  WHEN 9 THEN '运动户外'
  WHEN 10 THEN '母婴玩具'
  WHEN 11 THEN '图书文娱'
  WHEN 12 THEN '汽车用品'
  WHEN 13 THEN '珠宝配饰'
  WHEN 14 THEN '宠物生活'
  WHEN 15 THEN '厨房用具'
  WHEN 16 THEN '家装建材'
  WHEN 17 THEN '家具收纳'
  WHEN 18 THEN '健康保健'
  WHEN 19 THEN '个护清洁'
  WHEN 20 THEN '酒水饮料'
  WHEN 21 THEN '钟表眼镜'
  WHEN 22 THEN '潮流新品'
  WHEN 23 THEN '品质好货'
  WHEN 0 THEN '每日必买'
END), '类商品，品质可靠，支持七天无理由退换。');

UPDATE news
SET title = CONCAT('商城快报第', id, '期'),
    introduction = '平台上新与促销活动同步更新，欢迎查看详情。',
    content = CONCAT('<p>【第', id, '期】本周推荐好物已上线，支持下单、收藏、评论与分享。</p><p>关注店铺可获取后续优惠信息。</p>');

UPDATE discussshangpinxinxi
SET nickname = CONCAT('用户', userid),
    content = CONCAT('商品体验不错，物流很快，评论编号#', id),
    reply = IFNULL(reply, '');
