/*
 * Copyright 2014, Red Hat, Inc. and individual contributors as indicated by the
 * @author tags. See the copyright.txt file in the distribution for a full
 * listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This software is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this software; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA, or see the FSF
 * site: http://www.fsf.org.
 */
package org.zanata.feature.misc

import org.junit.jupiter.api.DisplayName
import org.junit.jupiter.api.Test
import org.zanata.feature.testharness.ZanataTestCase
import org.zanata.page.utility.Error404Page
import org.zanata.workflow.BasicWorkFlow

import org.assertj.core.api.Assertions.assertThat

/**
 * @author Damian Jansen [djansen@redhat.com](mailto:djansen@redhat.com)
 */
class PageNotFoundTest : ZanataTestCase() {

    @Test
    @DisplayName("A 404 page is displayed on an invalid link")
    fun `A 404 page is displayed on an invalid link`() {
        var error404Page = BasicWorkFlow()
                .goToPage("notAPage", Error404Page::class.java)

        assertThat(error404Page.isItA404)
                .describedAs("Standard page shows a 404 error")
                .isTrue()

        error404Page = BasicWorkFlow()
                .goToPage("projects/view/NotAProject", Error404Page::class.java)

        assertThat(error404Page.isItA404)
                .describedAs("Seam 'entity not found' page shows a 404 error")
                .isTrue()
    }
}