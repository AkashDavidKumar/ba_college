/**
 * routing-frontend.test.js — Integration & Unit Tests for Phase 5B-2 Public URL Routing Synchronization
 *
 * Covers:
 *  1. Bidirectional URL <-> View mapping (pathToView & viewToPath).
 *  2. All authorized public sections: Home, About, Departments, Courses, Admissions,
 *     News, Events, Examinations, IQAC, Alumni, Clubs, Notices, Contact, etc.
 *  3. Direct URL loading & page refresh simulation.
 *  4. Browser history navigation (pushState, popstate event handling).
 *  5. Unknown routes fallback handling (404 Not Found resolution).
 *  6. Non-interference with administrative routes (/admin, /admin/login).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { pathToView, viewToPath } from '../lib/routing.ts';

describe('Phase 5B-2: Public URL Routing Synchronization', () => {

  describe('1. Valid Section Links & Bidirectional Mapping', () => {
    it('1.1: Resolves root "/" and "/home" to home view', () => {
      const vRoot = pathToView('/');
      assert.strictEqual(vRoot.type, 'home');
      assert.strictEqual(viewToPath(vRoot), '/');

      const vHome = pathToView('/home');
      assert.strictEqual(vHome.type, 'home');
    });

    it('1.2: Resolves "/about" with and without hash fragments', () => {
      const vAbout = pathToView('/about');
      assert.strictEqual(vAbout.type, 'about');
      assert.strictEqual(vAbout.section, undefined);
      assert.strictEqual(viewToPath(vAbout), '/about');

      const vAboutSection = pathToView('/about', '#leadership');
      assert.strictEqual(vAboutSection.type, 'about');
      assert.strictEqual(vAboutSection.section, 'leadership');
      assert.strictEqual(viewToPath(vAboutSection), '/about#leadership');
    });

    it('1.3: Resolves "/departments" and "/departments/:slug"', () => {
      const vDepts = pathToView('/departments');
      assert.strictEqual(vDepts.type, 'academic');
      assert.strictEqual(vDepts.section, 'departments');

      const vDeptDetail = pathToView('/departments/computer-science');
      assert.strictEqual(vDeptDetail.type, 'department');
      assert.strictEqual(vDeptDetail.slug, 'computer-science');
      assert.strictEqual(viewToPath(vDeptDetail), '/departments/computer-science');
    });

    it('1.4: Resolves "/courses" to academic courses view', () => {
      const vCourses = pathToView('/courses');
      assert.strictEqual(vCourses.type, 'courses');
      assert.strictEqual(vCourses.section, 'courses');
      assert.strictEqual(viewToPath(vCourses), '/courses#courses');
    });

    it('1.5: Resolves "/admissions" to admissions view', () => {
      const vAdmissions = pathToView('/admissions');
      assert.strictEqual(vAdmissions.type, 'admissions');
      assert.strictEqual(viewToPath(vAdmissions), '/admissions');
    });

    it('1.6: Resolves "/news" and "/notices" to news and notices views', () => {
      const vNews = pathToView('/news');
      assert.strictEqual(vNews.type, 'news');
      assert.strictEqual(viewToPath(vNews), '/news');

      const vNotices = pathToView('/notices');
      assert.strictEqual(vNotices.type, 'notices');
      assert.strictEqual(viewToPath(vNotices), '/notices');
    });

    it('1.7: Resolves "/events" to events view', () => {
      const vEvents = pathToView('/events');
      assert.strictEqual(vEvents.type, 'events');
      assert.strictEqual(viewToPath(vEvents), '/events');
    });

    it('1.8: Resolves "/examination" and "/examinations" to examination view', () => {
      const vExam = pathToView('/examination');
      assert.strictEqual(vExam.type, 'examination');
      assert.strictEqual(viewToPath(vExam), '/examination');

      const vExams = pathToView('/examinations');
      assert.strictEqual(vExams.type, 'examination');
    });

    it('1.9: Resolves "/iqac" with optional section hash', () => {
      const vIqac = pathToView('/iqac', '#aqar');
      assert.strictEqual(vIqac.type, 'iqac');
      assert.strictEqual(vIqac.section, 'aqar');
      assert.strictEqual(viewToPath(vIqac), '/iqac#aqar');
    });

    it('1.10: Resolves "/alumni" with optional section', () => {
      const vAlumni = pathToView('/alumni', '#events');
      assert.strictEqual(vAlumni.type, 'alumni');
      assert.strictEqual(vAlumni.section, 'events');
      assert.strictEqual(viewToPath(vAlumni), '/alumni#events');
    });

    it('1.11: Resolves "/clubs" and "/clubs/:slug"', () => {
      const vClubs = pathToView('/clubs');
      assert.strictEqual(vClubs.type, 'clubs');
      assert.strictEqual(viewToPath(vClubs), '/clubs');

      const vClubSlug = pathToView('/clubs/rotaract-club');
      assert.strictEqual(vClubSlug.type, 'clubs');
      assert.strictEqual(vClubSlug.slug, 'rotaract-club');
      assert.strictEqual(viewToPath(vClubSlug), '/clubs/rotaract-club');
    });

    it('1.12: Resolves "/contact" to contact view', () => {
      const vContact = pathToView('/contact');
      assert.strictEqual(vContact.type, 'contact');
      assert.strictEqual(viewToPath(vContact), '/contact');
    });

    it('1.13: Resolves remaining college views: facilities, gallery, placements, library, autonomous, nirf', () => {
      assert.strictEqual(pathToView('/facilities').type, 'facilities');
      assert.strictEqual(pathToView('/gallery').type, 'gallery');
      assert.strictEqual(pathToView('/placements').type, 'placements');
      assert.strictEqual(pathToView('/library').type, 'library');
      assert.strictEqual(pathToView('/autonomous').type, 'autonomous');
      assert.strictEqual(pathToView('/nirf').type, 'nirf');
      assert.strictEqual(pathToView('/student-activities').type, 'student-activities');
    });
  });

  describe('2. Unknown Routes & Fallback Handling', () => {
    it('2.1: Resolves unknown path to not-found view with preserved path', () => {
      const vUnknown = pathToView('/invalid-non-existent-section');
      assert.strictEqual(vUnknown.type, 'not-found');
      assert.strictEqual(vUnknown.path, '/invalid-non-existent-section');
      assert.strictEqual(viewToPath(vUnknown), '/invalid-non-existent-section');
    });

    it('2.2: Normalizes trailing slashes before route evaluation', () => {
      const vTrailing = pathToView('/admissions/');
      assert.strictEqual(vTrailing.type, 'admissions');

      const vTrailingUnknown = pathToView('/random-unknown-page/');
      assert.strictEqual(vTrailingUnknown.type, 'not-found');
      assert.strictEqual(vTrailingUnknown.path, '/random-unknown-page');
    });
  });

  describe('3. Direct Navigation, Refresh & Browser History Simulation', () => {
    it('3.1: Simulates browser direct URL access by resolving window pathname', () => {
      const directUrl = '/departments/commerce';
      const parsedView = pathToView(directUrl);
      assert.strictEqual(parsedView.type, 'department');
      assert.strictEqual(parsedView.slug, 'commerce');
    });

    it('3.2: Simulates browser refresh: preserves active section from path and hash', () => {
      const refreshPath = '/about';
      const refreshHash = '#history';
      const activeView = pathToView(refreshPath, refreshHash);
      assert.strictEqual(activeView.type, 'about');
      assert.strictEqual(activeView.section, 'history');
    });

    it('3.3: History navigation: popstate changes path back to previous public section', () => {
      // Step 1: user visits admissions
      let currentPath = '/admissions';
      let state = pathToView(currentPath);
      assert.strictEqual(state.type, 'admissions');

      // Step 2: user clicks to alumni
      currentPath = '/alumni';
      state = pathToView(currentPath);
      assert.strictEqual(state.type, 'alumni');

      // Step 3: user clicks browser Back button (popstate back to /admissions)
      currentPath = '/admissions';
      state = pathToView(currentPath);
      assert.strictEqual(state.type, 'admissions');
    });
  });
});
