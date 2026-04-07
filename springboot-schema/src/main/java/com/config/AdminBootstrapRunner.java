package com.config;

import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.UserEntity;
import com.entity.YonghuEntity;
import com.service.UserService;
import com.service.YonghuService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    @Autowired
    private UserService userService;
    @Autowired
    private YonghuService yonghuService;

    @Override
    public void run(String... args) {
        UserEntity admin = userService.selectOne(new EntityWrapper<UserEntity>().eq("username", "admin"));
        if (admin == null) {
            UserEntity user = new UserEntity();
            user.setUsername("admin");
            user.setPassword("123456");
            user.setRole("\u7ba1\u7406\u5458");
            userService.insert(user);
        }

        YonghuEntity mallUser = yonghuService.selectOne(new EntityWrapper<YonghuEntity>().eq("zhanghao", "admin"));
        if (mallUser == null) {
            YonghuEntity yonghu = new YonghuEntity();
            yonghu.setZhanghao("admin");
            yonghu.setMima("123456");
            yonghu.setXingming("\u7ba1\u7406\u5458");
            yonghu.setMoney(999999f);
            yonghuService.insert(yonghu);
        }
    }
}
