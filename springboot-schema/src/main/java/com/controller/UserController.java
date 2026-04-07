package com.controller;

import java.util.Arrays;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.annotation.IgnoreAuth;
import com.baomidou.mybatisplus.mapper.EntityWrapper;
import com.entity.UserEntity;
import com.service.TokenService;
import com.service.UserService;
import com.utils.MPUtil;
import com.utils.PageUtils;
import com.utils.PasswordPolicyUtil;
import com.utils.R;

@RequestMapping("users")
@RestController
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private TokenService tokenService;

    @IgnoreAuth
    @PostMapping(value = "/login")
    public R login(String username, String password, String captcha, HttpServletRequest request) {
        UserEntity user = userService.selectOne(new EntityWrapper<UserEntity>().eq("username", username));
        if (user == null || !user.getPassword().equals(password)) {
            return R.error("\u8d26\u53f7\u6216\u5bc6\u7801\u4e0d\u6b63\u786e");
        }
        String token = tokenService.generateToken(user.getId(), username, "users", user.getRole());
        return R.ok().put("token", token);
    }

    @IgnoreAuth
    @PostMapping(value = "/register")
    public R register(@RequestBody UserEntity user) {
        String passwordError = PasswordPolicyUtil.validatePassword(user.getPassword());
        if (passwordError != null) {
            return R.error(passwordError);
        }
        if (userService.selectOne(new EntityWrapper<UserEntity>().eq("username", user.getUsername())) != null) {
            return R.error("\u7528\u6237\u5df2\u5b58\u5728");
        }
        userService.insert(user);
        return R.ok();
    }

    @GetMapping(value = "logout")
    public R logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return R.ok("\u9000\u51fa\u6210\u529f");
    }

    @IgnoreAuth
    @RequestMapping(value = "/resetPass")
    public R resetPass(String username, HttpServletRequest request) {
        UserEntity user = userService.selectOne(new EntityWrapper<UserEntity>().eq("username", username));
        if (user == null) {
            return R.error("\u8d26\u53f7\u4e0d\u5b58\u5728");
        }
        user.setPassword("123456");
        userService.update(user, null);
        return R.ok("\u5bc6\u7801\u5df2\u91cd\u7f6e\u4e3a\uff1a123456");
    }

    @RequestMapping("/page")
    public R page(@RequestParam Map<String, Object> params, UserEntity user) {
        EntityWrapper<UserEntity> ew = new EntityWrapper<UserEntity>();
        PageUtils page = userService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.allLike(ew, user), params), params));
        return R.ok().put("data", page);
    }

    @RequestMapping("/list")
    public R list(UserEntity user) {
        EntityWrapper<UserEntity> ew = new EntityWrapper<UserEntity>();
        ew.allEq(MPUtil.allEQMapPre(user, "user"));
        return R.ok().put("data", userService.selectListView(ew));
    }

    @RequestMapping("/info/{id}")
    public R info(@PathVariable("id") String id) {
        UserEntity user = userService.selectById(id);
        return R.ok().put("data", user);
    }

    @RequestMapping("/session")
    public R getCurrUser(HttpServletRequest request) {
        Long id = (Long) request.getSession().getAttribute("userId");
        UserEntity user = userService.selectById(id);
        return R.ok().put("data", user);
    }

    @PostMapping("/save")
    public R save(@RequestBody UserEntity user) {
        String passwordError = PasswordPolicyUtil.validatePassword(user.getPassword());
        if (passwordError != null) {
            return R.error(passwordError);
        }
        if (userService.selectOne(new EntityWrapper<UserEntity>().eq("username", user.getUsername())) != null) {
            return R.error("\u7528\u6237\u5df2\u5b58\u5728");
        }
        userService.insert(user);
        return R.ok();
    }

    @RequestMapping("/update")
    public R update(@RequestBody UserEntity user) {
        if (StringUtils.isNotBlank(user.getPassword())) {
            String passwordError = PasswordPolicyUtil.validatePassword(user.getPassword());
            if (passwordError != null) {
                return R.error(passwordError);
            }
        }
        UserEntity u = userService.selectOne(new EntityWrapper<UserEntity>().eq("username", user.getUsername()));
        if (u != null && u.getId() != user.getId() && u.getUsername().equals(user.getUsername())) {
            return R.error("\u7528\u6237\u540d\u5df2\u5b58\u5728");
        }
        userService.updateById(user);
        return R.ok();
    }

    @RequestMapping("/delete")
    public R delete(@RequestBody Long[] ids) {
        userService.deleteBatchIds(Arrays.asList(ids));
        return R.ok();
    }
}
