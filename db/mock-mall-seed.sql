USE `springcloudk02l8`;

-- 可重复执行：先删除本脚本使用的固定 ID，再插入高质量演示数据
DELETE FROM `discussshangpinxinxi` WHERE `id` BETWEEN 98001 AND 98100;
DELETE FROM `shangpinxinxi` WHERE `id` BETWEEN 96001 AND 96100;
DELETE FROM `shangpinfenlei` WHERE `id` BETWEEN 95001 AND 95100;
DELETE FROM `news` WHERE `id` BETWEEN 97001 AND 97100;
DELETE FROM `yonghu` WHERE `id` BETWEEN 99001 AND 99100;

INSERT INTO `shangpinfenlei` (`id`, `addtime`, `leixing`) VALUES
(95001, NOW(), '手机数码'),
(95002, NOW(), '家用电器'),
(95003, NOW(), '电脑办公'),
(95004, NOW(), '服饰鞋包'),
(95005, NOW(), '家居好物'),
(95006, NOW(), '运动户外'),
(95007, NOW(), '食品生鲜'),
(95008, NOW(), '美妆个护');

INSERT INTO `shangpinxinxi` (
  `id`, `addtime`, `shangpinmingcheng`, `shangpinleixing`, `guige`, `shangjiashijian`,
  `shangpinjieshao`, `shangpintupian`, `thumbsupnum`, `crazilynum`, `clicktime`,
  `clicknum`, `price`, `onelimittimes`, `alllimittimes`
) VALUES
(96001, NOW(), '旗舰性能手机 Pro', '手机数码', '12GB+256GB', CURDATE(), '<p>高性能芯片，120Hz 高刷屏，支持 67W 快充，适合重度游戏和影像需求。</p>', 'upload/shangpinxinxi_shangpintupian1.jpg', 268, 12, NOW(), 1826, 3999.00, 2, 120),
(96002, NOW(), '超轻办公笔记本 Air', '电脑办公', '16GB+512GB', CURDATE(), '<p>全金属机身，续航可达 12 小时，适合远程办公与差旅场景。</p>', 'upload/shangpinxinxi_shangpintupian2.jpg', 189, 9, NOW(), 1378, 5299.00, 1, 80),
(96003, NOW(), '智能降噪蓝牙耳机', '手机数码', 'ANC+通透模式', CURDATE(), '<p>地铁、办公室双场景降噪，低延迟模式提升游戏体验。</p>', 'upload/shangpinxinxi_shangpintupian3.jpg', 356, 6, NOW(), 2410, 399.00, 3, 300),
(96004, NOW(), '一级能效变频空调', '家用电器', '1.5匹 壁挂式', CURDATE(), '<p>快速制冷制热，节能静音，支持手机远程控制。</p>', 'upload/shangpinxinxi_shangpintupian4.jpg', 122, 4, NOW(), 968, 2699.00, 1, 60),
(96005, NOW(), '人体工学电脑椅', '家居好物', '可调头枕+腰托', CURDATE(), '<p>久坐不累，适配多种身高，兼顾办公与电竞使用需求。</p>', 'upload/shangpinxinxi_shangpintupian5.jpg', 177, 3, NOW(), 1116, 899.00, 2, 150),
(96006, NOW(), '智能手表运动版', '运动户外', 'GPS+心率监测', CURDATE(), '<p>支持 100+ 运动模式，全天候健康监测与消息提醒。</p>', 'upload/shangpinxinxi_shangpintupian6.jpg', 204, 5, NOW(), 1432, 699.00, 2, 180),
(96007, NOW(), '轻奢通勤女包', '服饰鞋包', '黑色 中号', CURDATE(), '<p>高密度防泼面料，分区收纳，通勤和短途旅行都好用。</p>', 'upload/picture1.jpg', 98, 2, NOW(), 640, 329.00, 2, 200),
(96008, NOW(), '精品牛排组合装', '食品生鲜', '4 片装 共 1kg', CURDATE(), '<p>冷链到家，肉质细嫩，适合家庭煎烤和聚会场景。</p>', 'upload/picture2.jpg', 146, 1, NOW(), 888, 239.00, 3, 260),
(96009, NOW(), '修护保湿精华套装', '美妆个护', '水乳精华三件套', CURDATE(), '<p>改善干燥粗糙，提升肌肤稳定性，适合日常基础护肤。</p>', 'upload/picture3.jpg', 215, 7, NOW(), 1530, 459.00, 2, 220),
(96010, NOW(), '家用多功能空气炸锅', '家用电器', '6L 大容量', CURDATE(), '<p>可视化窗口，支持烘焙烤肉薯条等多种菜单，一锅多用。</p>', 'upload/shangpinxinxi_shangpintupian1.jpg', 134, 3, NOW(), 1021, 499.00, 2, 140);

INSERT INTO `news` (`id`, `addtime`, `title`, `introduction`, `picture`, `content`) VALUES
(97001, NOW(), '618 大促选购指南：如何买到真正高性价比', '从价格曲线、品牌口碑、售后保障三个维度帮你避坑，买对不买贵。', 'upload/news_picture1.jpg', '<p>大促期间建议优先关注近 30 天价格走势，避免“先涨后降”。</p><p>对于高客单商品，优先选择自营或官方旗舰店，并确认是否支持价保。</p>'),
(97002, NOW(), '新手装机推荐：办公、设计、游戏三套方案', '按预算分档推荐电脑配置，帮助用户快速选到匹配场景的整机方案。', 'upload/news_picture2.jpg', '<p>办公场景优先关注稳定性和噪音控制。</p><p>设计场景应将预算重点放在 CPU 与内存；游戏场景建议关注显卡性能与散热能力。</p>'),
(97003, NOW(), '夏季空调选购要点：匹数、能效、噪音一次讲清', '买空调前先看房间面积和能效等级，后续使用成本更省心。', 'upload/news_picture3.jpg', '<p>卧室建议优先静音型号，客厅优先快速制冷能力。</p><p>一级能效虽然首购价略高，但长期电费更划算。</p>'),
(97004, NOW(), '居家办公升级清单：提升效率的 8 件好物', '从人体工学到桌面收纳，打造长期舒适高效的办公环境。', 'upload/news_picture4.jpg', '<p>椅子和显示器支架是最值得优先投入的两类产品。</p><p>稳定的照明和整洁的桌面能显著降低疲劳感。</p>');

INSERT INTO `yonghu` (`id`, `addtime`, `zhanghao`, `mima`, `xingming`, `xingbie`, `shouji`, `youxiang`, `touxiang`, `money`) VALUES
(99001, NOW(), 'mall_user_a', '123456', '林晓', '女', '13800010001', 'linxiao@example.com', 'upload/yonghu_touxiang1.jpg', 1688.00),
(99002, NOW(), 'mall_user_b', '123456', '陈诺', '男', '13800010002', 'chennuo@example.com', 'upload/yonghu_touxiang2.jpg', 2350.00),
(99003, NOW(), 'mall_user_c', '123456', '赵晴', '女', '13800010003', 'zhaoqing@example.com', 'upload/yonghu_touxiang3.jpg', 980.00);

INSERT INTO `discussshangpinxinxi` (`id`, `addtime`, `refid`, `userid`, `nickname`, `content`, `reply`) VALUES
(98001, NOW(), 96001, 99001, '林晓', '拍照非常清晰，夜景也很稳，续航一天无压力。', '感谢支持，后续系统更新会继续优化影像体验。'),
(98002, NOW(), 96001, 99002, '陈诺', '屏幕顺滑，打游戏温控比上一代好很多。', '感谢反馈，建议搭配 67W 原装充电器体验更佳。'),
(98003, NOW(), 96002, 99003, '赵晴', '机身很轻，带出差完全无负担，键盘手感也不错。', '感谢认可，办公场景我们也有扩展坞可选。'),
(98004, NOW(), 96003, 99001, '林晓', '降噪效果明显，地铁里听播客很舒服。', '感谢好评，通透模式在户外场景会更安全。'),
(98005, NOW(), 96005, 99002, '陈诺', '椅子支撑很到位，久坐腰不酸了。', '感谢选择，建议根据身高再微调腰托高度。'),
(98006, NOW(), 96009, 99003, '赵晴', '连续用了两周，保湿效果很好，肤感清爽。', '感谢分享，搭配防晒产品效果会更稳定。');
